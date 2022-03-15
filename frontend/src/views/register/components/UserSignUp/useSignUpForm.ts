import { SubmitHandler, useForm } from 'react-hook-form';
import { UserSignUpFormFields } from '../../../../typings';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../../../../utils';
import { useAppDispatch } from '../../../../store';
import { nextStep } from '../../../../store/registerSlice';
import { userSignUp } from '../../../../store/userSlice';
import { useSnackbar } from 'notistack';
/**
 * Business logic for uesr sign up inclucing
 * sending POST request through redux
 * validating the form
 */
export const useSignUpForm = () => {
  const {
    register,
    formState: { errors },
    getValues,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
  } = useForm<UserSignUpFormFields>({
    mode: 'onBlur',
    defaultValues: {
      dateOfBirth: null,
    },
  });
  const dispatch = useAppDispatch();
  const [displayDOB, setDisplayDob] = useState<Dayjs | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  /**
   * Submit form handler
   * it will validate the sign up form before sending the request
   */
  const doSubmit: SubmitHandler<UserSignUpFormFields> = (data) => {
    console.log(data);
    dispatch(userSignUp(data))
      .unwrap()
      .then(() => dispatch(nextStep()))
      .catch((err) => {
        if (err.status > -1 && err.status < 500) {
          setError('username', err.message);
        } else {
          enqueueSnackbar(err.message, { variant: 'error' });
        }
      });
  };
  const onSubmit = handleSubmit(doSubmit);

  /**
   * handle business logic for date of birth
   */
  const handleDOBChange = (newState: Dayjs | null, caller: string) => {
    setValue('dateOfBirth', newState);
    setDisplayDob(() => {
      console.log(newState, caller);
      if (newState !== null && !!errors.dateOfBirth) {
        clearErrors('dateOfBirth');
      } else if (newState === null && !!!errors.dateOfBirth) {
        setError('dateOfBirth', {
          type: 'required',
          message: 'Please select a date',
        });
      }
      return newState;
    });
  };

  /**
   * validators of form fields
   */
  const validators = {
    username: register('username', {
      required: 'Email address is required',
      pattern: {
        message: 'Invalid email address',
        value: EMAIL_REGEX,
      },
    }),
    password: register('password', {
      required: 'Password is required',
      pattern: {
        message: 'Invalid password Format',
        value: PASSWORD_REGEX,
      },
    }),

    confirmPassowrd: register('confirmPassword', {
      required: 'Please re-enter your password',
      validate: (val) =>
        val === getValues('password') || 'These two password does not match',
    }),
    dateOfBirth: {
      ...register('dateOfBirth', {
        setValueAs: (v) => (v === null ? null : dayjs(v)),
        validate: () => displayDOB !== null || 'You must select date of birth',
      }),
      onClose: () => handleDOBChange(getValues('dateOfBirth'), 'onClose'),
      handleDateChange: (date: Dayjs | null) =>
        handleDOBChange(date, 'onChange'),
      value: getValues('dateOfBirth'),
    },

    isDoctor: register('isDoctor', { value: false }),
    firstName: register('firstName', {
      required: 'First name is required',
      maxLength: 30,
    }),
    lastName: register('lastName', {
      required: 'Last name is required',
      maxLength: 30,
    }),
    gender: register('gender', {
      required: 'You must select a gender',
      value: 'male',
    }),
  };

  return { errors, validators, onSubmit, getValues };
};
