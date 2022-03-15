/** @format */
/**
 * Author: Chi Zhang (z5211214)
 */
import React, { PropsWithChildren } from 'react';
import Paper from '@mui/material/Paper';
import './FormContainer.css';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

interface FormContainerProps {
  /**
   * title of the form
   */
  title: string;
  /**
   * Width of the form
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * The handler for the submit event
   */
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}
/** The container that wraps the form */
const FormContainer = (props: PropsWithChildren<FormContainerProps>) => (
  <div className="form-container">
    <Paper
      variant="outlined"
      className={`form-root form-${props.size || 'sm'}`}
      elevation={0}
    >
      <div className="form-title">
        <Avatar
          sx={{
            backgroundColor: (theme) => theme.palette.secondary.main,
          }}
        >
          C
        </Avatar>
        <Typography variant="h4" component="p">
          {props.title}
        </Typography>
      </div>
      <form onSubmit={props.onSubmit}>{props.children}</form>
    </Paper>
  </div>
);

export default FormContainer;
