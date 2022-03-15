/** @format */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import store, { persistor } from './store';
import ChatBotApp from './views';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateAdapter from '@mui/lab/AdapterDayjs';
import { SnackbarProvider } from 'notistack';
import { PersistGate } from 'redux-persist/integration/react';
function App() {
  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            autoHideDuration={2000}
          >
            <BrowserRouter>
              <CssBaseline />
              <ChatBotApp />
            </BrowserRouter>
          </SnackbarProvider>
        </PersistGate>
      </ReduxProvider>
    </LocalizationProvider>
  );
}

export default App;
