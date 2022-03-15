/** @format */

import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './index.css';
import Login from './login';
import SignUp from './register';
import Chat from './chat';
import ChatBotAppBar from './components/AppBar/AppBar';
import ChatHistoryPage from './history';
import ProtectedRoute from './components/ProtectedRoute';
import TicketsRoute from './tickets';
import NewRequestRoute from './request';
import { ProfileCreation } from './register/components';
const ChatBotApp = () => (
  <div className="chatbot-app-root">
    <ChatBotAppBar />
    <Switch>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/register">
        <SignUp />
      </Route>
      <Route path="/history">
        <ChatHistoryPage />
      </Route>
      <ProtectedRoute path="/tickets">
        <TicketsRoute />
      </ProtectedRoute>
      <ProtectedRoute allowedRoles={['patient']} path="/new_request">
        <NewRequestRoute />
      </ProtectedRoute>
      <Route exact path="/">
        <Chat />
      </Route>
      <ProtectedRoute allowedRoles={['patient', 'doctor']} path="/profile">
        <ProfileCreation title="Update your profile" />
      </ProtectedRoute>
    </Switch>
  </div>
);

export default ChatBotApp;
