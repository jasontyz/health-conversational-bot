import { useAppSelector, useAppDispatch } from '../../../store';
import { pushMessage } from '../../../store/chatSlice';
import React from 'react';
import { VirtuosoHandle } from 'react-virtuoso';
import { v4 as uuidv4 } from 'uuid';
import { useSnackbar } from 'notistack';
import { UserTicketResponse } from '../../../typings';
import api from '../../../api';
const WELCOME_MESSAGE =
  'Hi there, I am Chatty, a medical health bot. ' +
  'You can talk to me in English. ' +
  'These are the skills I have:';
export function useChatHistory() {
  const chatHistories = useAppSelector((state) => state.chat.history);
  const dispatch = useAppDispatch();
  const virtuoso = React.useRef<VirtuosoHandle>(null);
  const [scrollTimeout, setScrollTimeout] = React.useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [atBottom, setAtBottom] = React.useState(true);

  const atBottomHandler = (bottom: boolean) => {
    if (bottom != atBottom) {
      setAtBottom(bottom);
    }
  };

  /**
   * if user is not at the latest message,
   * when a new message was sent,
   * automatically scroll to the bottom,
   *
   * Note: setTimeout compensates for the asnyc
   * Virtuoso list updates as suggested by the example
   * on their website (https://virtuoso.dev/stick-to-bottom/)
   *
   */
  React.useEffect(() => {
    if (scrollTimeout != null) {
      clearTimeout(scrollTimeout);
      setScrollTimeout(null);
    }
    if (!atBottom) {
      const timeoutId = setTimeout(
        () =>
          virtuoso.current!.scrollToIndex({
            index: chatHistories.length - 1,
            align: 'end',
            behavior: 'smooth',
          }),
        300,
      );
      setScrollTimeout(timeoutId);
    }
  }, [chatHistories]);
  React.useEffect(() => {
    if (chatHistories.length === 0) {
      dispatch(
        pushMessage({
          type: 'welcome',
          message: WELCOME_MESSAGE,
          from: 'bot',
          msgId: uuidv4(),
        }),
      );
    }
  }, [chatHistories]);
  /**
   * Clean up timeout before disposing the component
   */
  React.useEffect(() => {
    return () => {
      if (scrollTimeout != null) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  const user = useAppSelector((state) => state.user);
  const logedIn = user.id !== '';
  const { enqueueSnackbar } = useSnackbar();
  React.useEffect(() => {
    if (logedIn) {
      api
        .get<UserTicketResponse>(`/users/${user.id}/ticket`, {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { dismiss: 1 },
        })
        .then((res) => {
          if (res.data.responded) {
            dispatch(
              pushMessage({
                type: 'ticket_response',
                message: 'Here is your response from the doctor',
                data: res.data.message,
                from: 'bot',
                msgId: uuidv4(),
              }),
            );
          }
        })
        .catch(() => {
          enqueueSnackbar('Failed to get your ticket', { variant: 'error' });
        });
    }
  }, [logedIn]);

  return {
    chatHistories,
    virtuoso,
    atBottomHandler,
  };
}
