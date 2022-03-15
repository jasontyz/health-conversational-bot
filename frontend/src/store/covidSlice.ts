import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkConfig } from '.';
import client from '../api';
import {
  ChatMessageWithCovidChoices,
  ChatMessageWithCovidResponse,
} from '../typings';

type SymptomPresence = '1' | '0' | '';

/** combineFeatures combines the feature as one string */

type CovidSliceState = {
  features: {
    ageAbove60: SymptomPresence;
    isMale: SymptomPresence;
    cough: SymptomPresence;
    fever: SymptomPresence;
    shortnessOfBreath: SymptomPresence;
    soreThroat: SymptomPresence;
    headache: SymptomPresence;
    closeContact: SymptomPresence;
  };
  questionIndex: number;
};

type CovidDiagnosisResp =
  | ChatMessageWithCovidChoices
  | ChatMessageWithCovidResponse;

const initialState: CovidSliceState = {
  features: {
    ageAbove60: '',
    isMale: '',
    cough: '',
    fever: '',
    shortnessOfBreath: '',
    soreThroat: '',
    headache: '',
    closeContact: '',
  },
  questionIndex: 0,
};
type CovidStateFields = keyof typeof initialState.features;
const combineFeatures = (features: typeof initialState.features) => {
  const FIELDS: CovidStateFields[] = [
    'cough',
    'fever',
    'soreThroat',
    'shortnessOfBreath',
    'headache',
    'ageAbove60',
    'isMale',
    'closeContact',
  ];
  let res = '';
  for (const v in FIELDS) {
    res += features[FIELDS[v]];
  }
  return res;
};

export const fetchCovidRequst = createAsyncThunk<
  CovidDiagnosisResp,
  SymptomPresence,
  AppThunkConfig
>('covid/fetchNext', async (action, thunkAPI) => {
  const state = thunkAPI.getState();
  const questionIndex = state.covid.questionIndex;
  const symptoms = { ...state.covid.features };
  const FIELDS: CovidStateFields[] = [
    'isMale',
    'ageAbove60',
    'cough',
    'fever',
    'soreThroat',
    'shortnessOfBreath',
    'headache',
    'closeContact',
  ];
  thunkAPI.dispatch({
    type: 'covid/setFeatures',
    payload: {
      [FIELDS[state.covid.questionIndex]]: action,
    },
  });

  symptoms[FIELDS[state.covid.questionIndex]] = action;
  thunkAPI.dispatch({ type: 'covid/increaseQuestionIndex' });
  try {
    if (!!state.user.id) {
      await client.put(
        `/users/${state.user.id}/history`,
        {
          message: action === '1' ? 'Yes' : 'No',
        },
        { headers: { Authorization: `Bearer ${state.user.token}` } },
      );
    }
    const resp = await client.post('/covid_checker/query', {
      index: questionIndex + 1,
      symptoms: combineFeatures(symptoms),
      user_id: state.user.id,
    });

    const data = resp.data as CovidDiagnosisResp;
    // Terminates diagnosis when complete
    if (data.type === 'covid_checker/result') {
      thunkAPI.dispatch({
        type: 'chat/setIsDiagnosing',
        payload: null,
      });
      // thunkAPI.dispatch({
      //   type: 'covid/setFeatures',
      //   payload: !!state.user.token
      //     ? getUserCovidFeatures(state.user.dateOfBirth, state.user.gender)
      //     : initialState.features,
      // });
      thunkAPI.dispatch({
        type: 'covid/setQuestionIndex',
        payload: !!state.user.token ? 2 : 0,
      });
    }
    thunkAPI.dispatch({
      type: 'chat/pushMessage',
      payload: data,
    });
    return data;
  } catch (err) {
    console.log(err);
    return thunkAPI.rejectWithValue(err);
  }
});

const covidSlice = createSlice({
  name: 'covid',
  initialState,
  reducers: {
    setFeatures(
      state,
      action: PayloadAction<Partial<typeof initialState.features>>,
    ) {
      state.features = { ...state.features, ...action.payload };
    },
    setQuestionIndex(state, action: PayloadAction<number>) {
      state.questionIndex = action.payload;
    },
    increaseQuestionIndex(state) {
      state.questionIndex++;
    },
    reset: () => initialState,
  },
});

export default covidSlice.reducer;
