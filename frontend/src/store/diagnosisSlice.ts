/**
 *  Author: Chi Zhang
 *  The redux slice for holding business logic gor diagnosis
 */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkConfig } from '.';
import client from '../api';
import { ChatMessageResp } from '../typings';
import { objectKeys2CamelCase, objectKeys2SnakeCase } from '../utils';
import { v4 as uuidv4 } from 'uuid';
/** Enum group for identifying the progress of diagnosis */
enum DiagnosisStages {
  AtSymptoms = 0,
  AtEvidence = 1,
  Finished = 2,
}

/** Typings for diagnosis state  info */
type DiagnosisState = {
  sessionId: string;
  evidenceIndex: number;
  symptoms: string[];
  stage: DiagnosisStages;
};

/** Initial state for diagnosis */
const diagnosisState: DiagnosisState = {
  sessionId: '',
  symptoms: [],
  evidenceIndex: 0,
  stage: DiagnosisStages.AtSymptoms,
};

/**
 * The action for send a message to the diagnosis endpoint
 * on server via a POST request
 *
 * The action payload is a string
 */
export const sendDiagnosisMessage = createAsyncThunk<
  ChatMessageResp,
  string,
  AppThunkConfig
>('diagnosis/sendMessage', async (payload, thunkApi) => {
  const state = thunkApi.getState();
  // push the message to history
  thunkApi.dispatch({
    type: 'chat/pushMessage',
    payload: {
      from: 'user',
      type: 'plain',
      message: payload,
      id: uuidv4(),
    },
  });
  const requestBody = {
    age: 30,
    sex: 'male',
    sessionId: state.diagnosis.sessionId,
    status: state.diagnosis.stage,
    query: payload,
    userId: state.user.id === '' ? null : state.user.id,
    evidenceIndex: state.diagnosis.evidenceIndex,
  };
  try {
    // Make the post request
    const resp = await client.post<ChatMessageResp>(
      '/diagnosis/',
      objectKeys2SnakeCase(requestBody),
    );
    // once succeeded, push the response to history
    thunkApi.dispatch({
      type: 'chat/pushMessage',
      payload: {
        from: 'bot',
        id: uuidv4(),
        ...objectKeys2CamelCase(resp.data),
      },
    });
    // Tell chat slice to reset the diagnosis flag
    // if diagnosis completes
    if (resp.data.type === 'diagnosis/result') {
      thunkApi.dispatch({
        type: 'chat/setIsDiagnosing',
        payload: null,
      });
    }
    return objectKeys2CamelCase(resp.data);
  } catch (err) {
    return thunkApi.rejectWithValue(err);
  }
});

/** diagnosisSlice holds the bussiness logic and state  */
const diagnosisSlice = createSlice({
  name: 'diagnosis',
  reducers: {
    setSessionId: (state, action: PayloadAction<string>) => {
      state.stage = DiagnosisStages.AtSymptoms;
      state.sessionId = action.payload;
    },
    // pushes symptoms to local and will be send to the server later
    // for batch diagnosis to save API calls
    pushSymptons: (state, action: PayloadAction<string>) => {
      state.symptoms = [...state.symptoms, action.payload];
    },
    // reset the diagnosis status
    reset: (state) => {
      state.sessionId = '';
      state.symptoms = [];
      state.stage = DiagnosisStages.AtSymptoms;
    },
  },
  initialState: diagnosisState,
  extraReducers: (builder) => {
    // For processing the diagnosis logic
    // Updates evidenceIndex after receiving response
    // (will only collect 5 evidences due to API call quota)
    // TODO: business logics for collect symptoms
    builder.addCase(sendDiagnosisMessage.fulfilled, (state, action) => {
      switch (action.payload.type) {
        case 'choice': {
          state.evidenceIndex++;
          if (state.stage === DiagnosisStages.AtSymptoms) {
            state.stage = DiagnosisStages.AtEvidence;
          }
          break;
        }
        // if diagnosis is done
        case 'diagnosis/result': {
          if (state.stage === DiagnosisStages.AtEvidence) {
            state.stage = DiagnosisStages.Finished;
            state.evidenceIndex = 0;
          }
          break;
        }
      }
    });
  },
});
export default diagnosisSlice.reducer;
export const { setSessionId } = diagnosisSlice.actions;
