import React from 'react';
import { useAppSelector } from '../../store';
import { useSnackbar } from 'notistack';
import { Redirect } from 'react-router-dom';
import ChatHistoryContent from './ChatHistoryContent';
/**
 * ChatHistoryPage renders the list view of the chat history.
 * if the user is not logged in,
 * they will be redirected to the login page.
 */
const ChatHistoryPage = () => {
  const loggedIn = useAppSelector((s) => !!s.user.token);
  const { enqueueSnackbar } = useSnackbar();
  React.useEffect(() => {
    if (!loggedIn) {
      enqueueSnackbar('You must be logged in to view this page.', {
        variant: 'error',
      });
    }
  });
  return loggedIn ? <ChatHistoryContent /> : <Redirect to="/login" />;
};
export default ChatHistoryPage;
