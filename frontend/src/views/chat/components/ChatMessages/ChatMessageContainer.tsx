import React, { PropsWithChildren } from 'react';

import Paper from '@mui/material/Paper';
import './ChatMessageContainer.css';


export interface ChatMessageContainerProps {
  fromUser: boolean;
  index: number;

}

/**
 * ChatMessageContainer wraps the content of actual message.
 * The background will be blue if the message is from user
 * otherwise will be gray. User messages are placed on the
 * right of the screen
 */
const ChatMessageContainer = (
  props: PropsWithChildren<ChatMessageContainerProps>,
) => {
  return (
    <>
      {props.fromUser && <div className="chat-message-pad" />}
      <Paper
        variant="outlined"
        className="chat-message"
        sx={
          props.fromUser
            ? {
                background: (theme) => theme.palette.primary.main,
              }
            : undefined
        }
      >
        {props.children}
      </Paper>
    </>
  );
};

export default ChatMessageContainer;
