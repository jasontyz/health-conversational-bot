import React, { ChangeEvent, useState } from 'react';
import {
  FormContainer,
  FormFieldContainer,
  FormRadioGroup,
} from '../../../components/Form';
import { UserProfile } from '../../../../typings';
import Button from '@mui/material/Button';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { userCreateProfile } from '../../../../store/userSlice';
import { useHistory } from 'react-router-dom';
import { Alert } from '@mui/material';
import { useSnackbar } from 'notistack';

/**
 * hooks for business lgoic
 * of profile creation
 */
const useProfileCreationForm = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const profile = useAppSelector((state) => state.user.profile);
  const currentProfile =
    profile === null
      ? {
          overweight: 0,
          diabetes: 0,
          highCholesterol: 0,
          hypertension: 0,
          smoking: 0,
        }
      : { ...profile };
  const [userProfile, setUserProfile] = useState<UserProfile>(currentProfile);
  const [error, setError] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();
  const title =
    profile === null ? 'Create your profile' : 'Update your profile';
  /**
   * Update value in the state object
   * it wraps the setUserProfile
   */
  const setValue = (k: keyof UserProfile, v: number) => {
    setUserProfile({
      ...userProfile,
      [k]: v,
    });
  };

  /**
   * Generate required props for each field
   * by giving the field name
   */
  const regsiterField = (k: keyof UserProfile) => ({
    value: userProfile[k],
    onChange: (ev: ChangeEvent<HTMLInputElement>) => {
      const v = parseInt((ev.target as HTMLInputElement).value);
      setValue(k, v);
    },
  });

  /**
   * Submit handler for submit profile via dispatch user action
   */
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault();
    console.log(userProfile);
    dispatch(userCreateProfile(userProfile))
      .unwrap()
      .then(() => history.push('/'))
      .catch((err) => {
        if (err.status > -1 && err.status < 500) {
          setError(err.message);
        } else {
          enqueueSnackbar(err.message, {
            variant: 'error',
          });
        }
      });
  };

  return { onSubmit, regsiterField, error, title };
};

/**
 * Profile creation form
 */
const ProfileCreation = (props: { title: string }) => {
  const { onSubmit, regsiterField, error } = useProfileCreationForm();
  return (
    <FormContainer size="md" title={props.title} onSubmit={onSubmit}>
      {!!error && <Alert severity="error">{error}</Alert>}
      <FormRadioGroup
        label={"I'm overweight or obese"}
        {...regsiterField('overweight')}
      />
      <FormRadioGroup
        label={'I smoke cigrattes'}
        {...regsiterField('smoking')}
      />
      <FormRadioGroup
        label={'I have high cholesterol'}
        {...regsiterField('highCholesterol')}
      />
      <FormRadioGroup
        label={'I have hypertension'}
        {...regsiterField('hypertension')}
      />
      <FormRadioGroup
        label={'I have diabetes'}
        {...regsiterField('diabetes')}
      />
      <FormFieldContainer>
        <Button type="submit" variant="contained" sx={{ boxShadow: 'unset' }}>
          Finish
        </Button>
      </FormFieldContainer>
    </FormContainer>
  );
};
export default ProfileCreation;
