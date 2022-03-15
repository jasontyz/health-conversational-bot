/** @format */

/**
 * Author: Chi Zhang (z5211214)
 * Componnts for register forms
 */
import TextField, { TextFieldProps } from '@mui/material/TextField';
import React, { PropsWithChildren } from 'react';
import { FieldError } from 'react-hook-form/dist/types/errors';
import { omit } from 'lodash';
import './FormComponents.css';
import Button, { ButtonProps } from '@mui/material/Button';
/** Prop types for FormField*/
interface FormFieldProps extends Omit<TextFieldProps, 'error' | 'ref'> {
  error: FieldError | undefined;
}

/**
 * Form field renderer function
 * it wraps the TextField
 */
const formFieldBuilder = (
  props: FormFieldProps,
  ref: React.ForwardedRef<HTMLDivElement>,
): JSX.Element => {
  const textFieldProps = omit(props, ['error']);

  /**
   * renders the text field with proper error message
   */
  return (
    <div className="form-field">
      <TextField
        fullWidth
        {...textFieldProps}
        ref={ref}
        error={!!props.error}
        helperText={props.error?.message}
      />
    </div>
  );
};

/** Wraps the component with forwardRef */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  formFieldBuilder,
);
FormField.displayName = 'FormField';

/** Form Button wraps */
export const FormButton = (props: ButtonProps) => (
  <div className="form-field">
    <Button {...props} />
  </div>
);

/**
 * The container wraps the form container
 * It sets the spacing between fields
 */
export const FormFieldContainer = (
  props: PropsWithChildren<{ className?: string }>,
) => {
  return (
    <div className={`form-field ${props.className}`}>{props.children}</div>
  );
};
