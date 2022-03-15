/** @format */
/**
 * Author: Chi Zhang (z5211214)
 * The actual store that combines with all other stores
 * and other some typed hooks
 */
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userSlice from './userSlice';
import registerSlice from './registerSlice';
import chatSlice from './chatSlice';
import diagnosisSlice from './diagnosisSlice';
import createTransform from 'redux-persist/es/createTransform';
import covidSlice from './covidSlice';
import dayjs from 'dayjs';

const rootReducer = combineReducers({
  user: userSlice,
  register: registerSlice,
  chat: chatSlice,
  diagnosis: diagnosisSlice,
  covid: covidSlice,
});

const ExpireTransformation = createTransform(
  (inboundState) => {
    return inboundState;
  },
  /**
   * if token expires, wipes off the user info
   */
  (outboundState: any, key) => {
    if (key !== 'user') {
      return outboundState;
    }
    console.log(outboundState.tokenExpiration - dayjs().unix());
    if (outboundState.tokenExpiration < dayjs().unix()) {
      console.log('token expired, wipe off credentials');
      return {
        token: '',
        firstName: '',
        lastName: '',
        tokenExpiration: null,
        id: '',
      };
    }
    return { ...outboundState };
  },
);

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['user', 'covid'],
  transforms: [ExpireTransformation],
};

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  persistConfig,
  rootReducer,
);

/** The redux store */
export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
/**
 * Typing information and typed hooks
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export interface AppThunkConfig {
  state: RootState;
  dispatch: AppDispatch;
}
export default store;
