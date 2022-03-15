/** @format */

import React from 'react';
import './login.css';
import { SubmitHandler, useForm } from 'react-hook-form';
import { UserCredentialPayload } from '../../typings';
import { EMAIL_REGEX } from '../../utils';
import {
  FormButton,
  FormContainer,
  FormField,
  FormFieldContainer,
} from '../components/Form';
import Link from '@mui/material/Link';
import { useSnackbar } from 'notistack';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { userLogin } from '../../store/userSlice';
/**
 * hooks for view-model of login page
 * Encapsulates login logic & validation of login form
 */
const useLoginForm = () => {
  const history = useHistory();
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<UserCredentialPayload>({
    mode: 'onBlur',
    criteriaMode: 'all',
    shouldUseNativeValidation: false,
  });
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  /**
   * redirect user to home page after login successfully
   */
  const doSubmit: SubmitHandler<UserCredentialPayload> = (data) => {
    dispatch(userLogin(data))
      .unwrap()
      .then(() => {
        history.push('/');
      })
      .catch((error) => {
        if (error.status > 0 && error.status < 500) {
          setError('password', { message: error.message });
          setError('username', { message: error.message });
        } else {
          enqueueSnackbar(error.message, { variant: 'error' });
        }
      });
  };
  /**
   * Validators for login fields
   */
  const validators = {
    username: {
      ...register('username', {
        required: 'Email address is required',
        pattern: {
          value: EMAIL_REGEX,
          message: 'Invalid Email address',
        },
      }),
    },
    password: {
      ...register('password', {
        required: 'Password is required',
      }),
    },
  };
  const handlers = {
    onGoToRegisterClick: () => {
      history.push('/register');
    },
    onFormSubmit: handleSubmit(doSubmit),
  };
  return { handlers, errors, validators };
};

/**
 * Component for login page
 */
const Login = () => {
  const { handlers, errors, validators } = useLoginForm();

  return (
    <FormContainer size="sm" title="Sign In" onSubmit={handlers.onFormSubmit}>
      <FormField
        label="Email Address"
        id="email"
        error={errors.username}
        {...validators.username}
      />
      <FormField
        label="Password"
        id="password"
        type="password"
        error={errors.password}
        {...validators.password}
      />
      <div className="login-button-bar">
        <FormButton type="submit" variant="outlined" className="login-button">
          Sign In
        </FormButton>
        <FormFieldContainer className="link-to-register">
          <Link onClick={() => handlers.onGoToRegisterClick()}>
            Doesn&rsquo;t have an account?
          </Link>
        </FormFieldContainer>
      </div>
    </FormContainer>
  );
};

export default Login;
