import React, { useState } from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { sendDiagnosisMessage } from '../../../../store/diagnosisSlice';
import {
  sendMessage,
  archiveMessage,
  pushMessage,
} from '../../../../store/chatSlice';
import { useSnackbar } from 'notistack';
import { fetchCovidRequst } from '../../../../store/covidSlice';
import { v4 as uuidv4 } from 'uuid';

type TextMessageOptionsProps = {
  msgId: string;
  options: {
    text: string;
    value: any;
  }[];
};

const useTextMessageWithOptions = () => {
  const dispatch = useAppDispatch();
  const diagnosisType = useAppSelector((state) => state.chat.diagnosis);
  const [disabled, setDisabled] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const makeOptionClickHandler =
    (v: any, t: string, id: string) => async () => {
      dispatch(archiveMessage(id));
      try {
        if (diagnosisType === 'normal') {
          await dispatch(sendDiagnosisMessage(t)).unwrap();
        } else if (diagnosisType === 'covid') {
          dispatch(
            pushMessage({
              type: 'plain',
              message: t,
              from: 'user',
              msgId: uuidv4(),
            }),
          );
          dispatch(fetchCovidRequst(v));
        } else {
          await dispatch(sendMessage({ message: t, choice: v })).unwrap();
        }
      } catch (error: any) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
      setDisabled(true);
    };
  return { disabled, makeOptionClickHandler };
};

const TextMessageOptions = (
  props: React.PropsWithChildren<TextMessageOptionsProps>,
) => {
  const { disabled, makeOptionClickHandler } = useTextMessageWithOptions();
  return (
    <ButtonGroup
      disabled={disabled}
      disableRipple
      variant="text"
      fullWidth
      orientation="vertical"
    >
      {props.options.map(({ text, value }, i) => (
        <Button
          disabled={disabled}
          className="chat-message-option"
          key={`message-${props.msgId}-option-${i}`}
          onClick={makeOptionClickHandler(value, text, props.msgId)}
        >
          {text}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default TextMessageOptions;
