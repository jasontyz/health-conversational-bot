import React from 'react';
import Typography from '@mui/material/Typography';
import ChatMessageContainer from './ChatMessageContainer';
import './ChatMessageBase.css';

export type ChatMessageBaseProps = React.PropsWithChildren<{
  extras?: React.ReactNode;
  dividerText?: string;
  index: number;
  fromUser: boolean;
}>;

const ChatMessageBase = (props: ChatMessageBaseProps) => {
  return (
    <ChatMessageContainer fromUser={props.fromUser} index={props.index}>
      <Typography
        variant="body1"
        component="p"
        className="chat-message-text"
        color={props.fromUser ? 'white' : undefined}
      >
        {props.children}
      </Typography>
      {props.extras && (
        <>
          <div className="chat-message-extras">{props.extras}</div>
        </>
      )}
    </ChatMessageContainer>
  );
};

export default ChatMessageBase;
