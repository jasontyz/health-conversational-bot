/** @format */

/**
 * Author: Chi Zhang (z5211214)
 * the slice for holding user info
 */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { omit } from 'lodash';
import { AppThunkConfig } from '.';
import client from '../api';
import {
  LoginResponse,
  ResponseWithMessage,
  UserCredentialPayload,
  UserProfile,
  UserSignUpPayload,
} from '../typings';
import { objectKeys2CamelCase, objectKeys2SnakeCase } from '../utils';

/** tpyings for root slice state */
interface RootSliceState {
  token: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  tokenExpiration: number | null;
  id: string;
  userLocation: { lat: number; lng: number } | null;
  profile: UserProfile | null;
  role: string;
}

/** Initial state for roo slice */
const rootSliceState: RootSliceState = {
  token: '',
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  tokenExpiration: null,
  id: '',
  role: '',
  userLocation: null,
  profile: null,
};

/**
 * Creates an async thunk action for user login
 */
const userLogin = createAsyncThunk<LoginResponse, UserCredentialPayload>(
  'user/login',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const resp = await client.post<LoginResponse>('/auth/login', {
        username: payload.username,
        password: payload.password,
      });
      const data = objectKeys2CamelCase(resp.data) as LoginResponse;
      const age =
        new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
      dispatch({
        type: 'covid/setFeatures',
        payload: {
          ageAbove60: age >= 60 ? '1' : '0',
          isMale: data.gender == 'male' ? '1' : '0',
        },
      });
      dispatch({
        type: 'covid/setQuestionIndex',
        payload: 2,
      });
      return data;
    } catch (err: any) {
      console.log(err);
      return rejectWithValue(err);
    }
  },
);

/**
 * Creates an async thunk action for user sign up
 *
 * It takes users' personal information as payload
 */
const userSignUp = createAsyncThunk<LoginResponse, UserSignUpPayload>(
  'user/signup',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      // manually convert bool to string
      const resp = await client.post<LoginResponse>('/users/', {
        ...objectKeys2SnakeCase(omit(payload, 'isDoctor')),
        date_of_birth: payload.dateOfBirth?.format('YYYY-MM-DD'),
        role: payload.isDoctor ? 'doctor' : 'patient',
      });
      const data = objectKeys2CamelCase(resp.data) as LoginResponse;
      const age =
        new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
      dispatch({
        type: 'covid/setFeatures',
        payload: {
          ageAbove60: age >= 60 ? '1' : '0',
          isMale: data.gender == 'male' ? '1' : '0',
        },
      });
      dispatch({
        type: 'covid/setQuestionIndex',
        payload: 2,
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  },
);
/**
 * Creates an async thunk action to
 * create a user profile
 *
 * It takes user's choices for health risks
 * as payload
 */
const userCreateProfile = createAsyncThunk<
  ResponseWithMessage,
  UserProfile,
  AppThunkConfig
>(
  'user/createProfile',
  async (payload, { rejectWithValue, getState, dispatch }) => {
    const state = getState();
    dispatch({
      type: 'user/setProfile',
      payload: payload,
    });
    try {
      const resp = await client.post<ResponseWithMessage>(
        `/users/${state.user.id}`,
        objectKeys2SnakeCase(payload),
        {
          headers: {
            Authorization: `Bearer ${state.user.token}`,
          },
        },
      );
      dispatch({ type: 'register/prevStep' });
      return resp.data;
    } catch (err: any) {
      return rejectWithValue(err);
    }
  },
);
/**
 * An async thunk action for user logout
 * It takes no payload
 */
const userLogout = createAsyncThunk<ResponseWithMessage, void, AppThunkConfig>(
  'user/logut',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const resp = await client.post<ResponseWithMessage>(
        '/auth/logout',
        null,
        {
          headers: {
            Authorization: `Bearer ${state.user.token}`,
          },
        },
      );
      dispatch({ type: 'chat/reset' });
      dispatch({ type: 'user/reset' });
      dispatch({ type: 'diagnosis/reset' });
      dispatch({ type: 'covid/reset' });
      return resp.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);
/**
 * rootSlice provides global state for other slices
 * e.g. user preference and JWT tokens.
 */
const userSlice = createSlice({
  name: 'user',
  initialState: rootSliceState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    reset: (state) => {
      state.token = '';
      state.firstName = '';
      state.lastName = '';
      state.id = '';
    },
    setUserLocation: (
      state,
      action: PayloadAction<{ lng: number; lat: number }>,
    ) => {
      state.userLocation = action.payload;
    },
    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(userLogin.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
    builder.addCase(userSignUp.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
    builder.addCase(userLogout.fulfilled, () => {
      return rootSliceState;
    });
  },
});

export const { setToken, reset, setUserLocation } = userSlice.actions;
export { userLogin, userSignUp, userCreateProfile, userLogout };
export default userSlice.reducer;
