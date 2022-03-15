/**
 * Author: Chi Zhang (z5211214)
 */

import SendIcon from '@mui/icons-material/Send';
import { useSnackbar } from 'notistack';
import { IconButton } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { sendMessage } from '../../../store/chatSlice';
import { sendDiagnosisMessage } from '../../../store/diagnosisSlice';
import './ChatTextInput.css';

/**
 * useChatTextInput hook encapsulates the
 * logic for sending messages
 */
const useChatTextInput = () => {
  const diagnosisType = useAppSelector((state) => state.chat.diagnosis);

  const dispatch = useAppDispatch();
  const [message, setMessage] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [disabledMsg, setDisabledMsg] = useState<string>('');

  React.useEffect(() => {
    if (diagnosisType === 'covid') {
      setDisabledMsg('Please choose the options under text bubble');
    } else {
      setDisabledMsg('');
    }
  }, [diagnosisType]);
  /**
   * do send message dispatchs the sendMessage / sendDiagnosisMessage
   * based on diagnosis status
   *
   * It will do nothing when message is empty
   */
  const doSendMessage = async () => {
    if (message === '') {
      return;
    }
    setMessage('');
    try {
      if (diagnosisType === 'normal') {
        await dispatch(sendDiagnosisMessage(message)).unwrap();
      } else {
        await dispatch(sendMessage({ message })).unwrap();
      }
    } catch (err: any) {
      enqueueSnackbar(err.message, {
        variant: 'error',
      });
    }
  };

  const onTextInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (ev) => {
    setMessage(ev.target.value);
  };
  const onEnterPressed: React.KeyboardEventHandler<HTMLDivElement> = async (
    ev,
  ) => {
    if (ev.key === 'Enter' && !ev.getModifierState('Shift')) {
      ev.preventDefault();
      await doSendMessage();
    }
  };

  const onSendButtonClick = () => {
    doSendMessage();
  };

  return {
    disabledMsg,
    onEnterPressed,
    onSendButtonClick,
    onTextInputChange,
    message,
  };
};

/** The text input bar and the button */
const ChatTextInput = () => {
  const {
    disabledMsg,
    onEnterPressed,
    onSendButtonClick,
    onTextInputChange,
    message,
  } = useChatTextInput();
  return (
    <div className="chat-textfield-container">
      <OutlinedInput
        disabled={disabledMsg !== ''}
        fullWidth
        multiline
        placeholder={disabledMsg}
        value={message}
        onChange={onTextInputChange}
        onKeyPress={onEnterPressed}
        maxRows={3}
        className="chat-textfield"
      />
      <IconButton
        aria-label="send"
        disabled={message === ''}
        color="primary"
        onClick={onSendButtonClick}
        className="text-input-send-button"
      >
        <SendIcon />
      </IconButton>
    </div>
  );
};

export default ChatTextInput;
