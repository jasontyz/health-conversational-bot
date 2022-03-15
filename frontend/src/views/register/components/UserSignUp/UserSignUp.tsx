import React from 'react';
import dayjs from 'dayjs';
import {
  FormContainer,
  FormField,
  FormFieldContainer,
} from '../../../components/Form';
import TextField from '@mui/material/TextField';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { omit } from 'lodash';
import { DesktopDatePicker } from '@mui/lab';
import './UserSignUp.css';
import { useSignUpForm } from './useSignUpForm';

/**
 * User sign up form
 */
export const UserSignUp = () => {
  const { validators, errors, onSubmit } = useSignUpForm();
  return (
    <FormContainer title="Sign Up" onSubmit={onSubmit}>
      <div className="fields-row">
        <FormField
          {...validators.firstName}
          error={errors.firstName}
          label="First Name"
          id="first-name"
        />
        <FormField
          {...validators.lastName}
          error={errors.lastName}
          label="Last Name"
          id="last-name"
        />
      </div>
      <FormField
        {...validators.username}
        error={errors.username}
        label="Email Address"
        id="email"
      />
      <FormField
        {...validators.password}
        error={errors.password}
        type="password"
        label="Password"
        id="password"
      />
      <FormField
        error={errors.confirmPassword}
        {...validators.confirmPassowrd}
        type="password"
        label="Confirm Password"
        id="confirm-password"
      />
      <div className="fields-row">
        <FormFieldContainer>
          <DesktopDatePicker
            label="Date of Birth"
            onChange={(date) => validators.dateOfBirth.handleDateChange(date)}
            maxDate={dayjs(new Date())}
            value={validators.dateOfBirth.value}
            onClose={validators.dateOfBirth.onClose}
            renderInput={(params) => (
              <TextField
                fullWidth
                {...params}
                {...omit(validators.dateOfBirth, 'handleDateChange', 'onClose')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
              />
            )}
          />
        </FormFieldContainer>
        <FormFieldContainer>
          <FormControl fullWidth>
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              id="gender-select"
              label="Gender"
              defaultValue="male"
              {...validators.gender}
              error={!!errors.gender}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>
          {!!errors.gender && (
            <FormHelperText error={!!errors.gender}>
              {errors.gender.message}
            </FormHelperText>
          )}
        </FormFieldContainer>
      </div>
      <FormFieldContainer>
        <FormControlLabel
          control={<Checkbox {...validators.isDoctor} />}
          label={"I'm a doctor"}
        />
      </FormFieldContainer>
      <FormFieldContainer>
        <Button variant="contained" type="submit" sx={{ boxShadow: 'unset' }}>
          Sign Up
        </Button>
      </FormFieldContainer>
    </FormContainer>
  );
};

export default UserSignUp;
