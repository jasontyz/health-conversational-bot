/**
 * Author: Chi Zhang
 * Date created: 27/10/2021
 *
 * The quick actions bar that allows
 * users to send predefined messages
 * by clicking on the shortcuts
 */

import React from 'react';
import './QuickActionBar.css';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useSnackbar } from 'notistack';
import { sendMessage } from '../../../store/chatSlice';

type QuickActionProps = {
  label: string;
  message: string;
};
const QuickAction = (props: QuickActionProps) => {
  const dispatch = useAppDispatch();
  const disabled = useAppSelector((state) => state.chat.diagnosis !== null);
  const { enqueueSnackbar } = useSnackbar();
  const onChipClicked: React.MouseEventHandler<HTMLDivElement> = () => {
    dispatch(sendMessage({ message: props.message }))
      .unwrap()
      .catch((err) => enqueueSnackbar(err.message, { variant: 'error' }));
  };
  return (
    <Chip
      disabled={disabled}
      clickable
      label={props.label}
      variant="outlined"
      onClick={onChipClicked}
    />
  );
};

/**
 * QuickActionBar is the containers for shortcuts
 */
const QuickActionBar = () => {
  return (
    <div className="quick-action-bar-container">
      <Stack direction="row" spacing={1}>
        <QuickAction
          label="Symtom Checker"
          message="I want to do a symptom check."
        />
        <QuickAction
          label="Recipe Suggestions"
          message="I want some recipe suggestions"
        />
        <QuickAction
          label="Covid-19 Symptom Checker"
          message="I want to do a covid-19 symptom check"
        />
        <QuickAction
          label="Covid-19 cases in Australia"
          message="I want the latest COVID-19 stats"
        />
        <QuickAction
          label="Trending Health News"
          message="I want some trending health news."
        />
      </Stack>
    </div>
  );
};
export default QuickActionBar;
