/**
 * Author: Chi Zhang
 * redux slice for holding business logic for chat
 */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkConfig } from '.';
import { ChatMessageObject, ChatMessageResp, UserProfile } from '../typings';
import { v4 as uuidv4 } from 'uuid';
import client from '../api';
import { objectKeys2CamelCase } from '../utils';
import { findIndex } from 'lodash';

type DiagnosisType = 'covid' | 'normal' | null;

/**
 * Typings for chat slice
 */
interface ChatSliceState {
  history: ChatMessageObject[];
  session: string;
  diagnosis: DiagnosisType;
  offsetId: string;
}

type PushMessagePayload = ChatMessageObject & {
  msgId?: string;
};
/**
 * Typings of payload of 'sendMessage' action
 */
type SendMessagePayload = {
  message: string;
  choice?: any;
  name?: string;
};
type MealTags = {
  health: string[];
  diet: string[];
};
/**
 * inferHealthTags is a utility function to infer
 * health tags from user profile
 * @param profile UserProfile: the user profile
 * @returns string[]: inferred health tags
 */
const inferMealTags = (profile: UserProfile): MealTags => {
  const healthTags: Set<string> = new Set();
  const dietTags: Set<string> = new Set();

  if (profile.diabetes > 0) {
    dietTags.add('low-carb');
    healthTags.add('sugar-conscious');
  }
  if (profile.highCholesterol > 0) {
    dietTags.add('low-fat');
  }
  if (profile.overweight > 0) {
    dietTags.add('low-fat');
    dietTags.add('low-carb');
  }
  if (profile.hypertension > 0) {
    dietTags.add('low-sodium');
  }
  return {
    health: Array.from(healthTags),
    diet: Array.from(dietTags),
  };
};

/**
 * Send message action
 * This action will be dispatched when the user pressed enter or clicked
 * the send button
 *
 * It takes an object payload (see above)
 */
export const sendMessage = createAsyncThunk<
  ChatMessageResp,
  SendMessagePayload,
  AppThunkConfig
>(
  'chat/sendMessage',
  async (payload, { rejectWithValue, dispatch, getState }) => {
    // pushes the user message to history
    const state = getState();

    dispatch({
      type: 'chat/pushMessage',
      payload: {
        from: 'user',
        type: 'plain',
        message: payload.message,
      },
    });
    // send the message to the server via a POST request
    const userId = state.user.id;
    const token = state.user.token;
    const mealTags = !!state.user.profile
      ? inferMealTags(state.user.profile)
      : {};
    const headers = !!userId
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;
    try {
      const resp = await client.post(
        `/chat/${userId}`,
        {
          message: payload.message,
          session: state.chat.session,
          extras: {
            ...state.user.userLocation,
            ...mealTags,
            questionIndex: state.covid.questionIndex,
          },
        },
        headers,
      );
      const data = objectKeys2CamelCase(resp.data) as ChatMessageResp;
      // If the response type is 'diagnosis/createSession'
      // then tell prepare the redux store for diagnosis
      // by setting a diagnosis session
      if (data.type === 'diagnosis/createSession') {
        console.log(data);
        dispatch({ type: 'chat/setIsDiagnosing', payload: 'normal' });
        dispatch({
          type: 'diagnosis/setSessionId',
          payload: data.data.sessionId,
        });
      } else if (data.type === 'covid_checker/choice') {
        dispatch({ type: 'chat/setIsDiagnosing', payload: 'covid' });
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  },
);

/** initial state for chatSlice */
const chatSliceState: ChatSliceState = {
  history: [],
  session: uuidv4(),
  diagnosis: null,
  offsetId: '',
};

/**
 * The chat slice itself to hold the relevant information
 */
export const chatSlice = createSlice({
  name: 'chat',
  initialState: chatSliceState,
  reducers: {
    // append a new message to history
    pushMessage: (state, action: PayloadAction<PushMessagePayload>) => {
      const msg = {
        ...action.payload,
        msgId: uuidv4(),
      };
      state.history.push(msg);
    },
    // set the flag for diagnosis
    setIsDiagnosing: (state, action: PayloadAction<DiagnosisType>) => {
      state.diagnosis = action.payload;
    },
    // dispose all the history and reset session info
    reset: (state) => {
      state.history = [];
      state.diagnosis = null;
      state.session = uuidv4();
    },
    archiveMessage: (state, action: PayloadAction<string>) => {
      const msgIndex = findIndex(
        state.history,
        (v) => v.msgId === action.payload,
      );
      state.history[msgIndex].archived = true;
    },
  },
  extraReducers: (builder) => {
    // push the response to to history after getting a response from the bot
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.history.push({
        ...action.payload,
        from: 'bot',
        archived: false,
        msgId: uuidv4(),
      });
    });
  },
});
export default chatSlice.reducer;
export const { pushMessage, reset, setIsDiagnosing, archiveMessage } =
  chatSlice.actions;
