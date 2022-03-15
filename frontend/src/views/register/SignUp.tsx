import React from 'react';
import { useAppSelector } from '../../store';
import { ProfileCreation, UserSignUp } from './components';

/**
 * Sign up page root component, it controlls the what child should be
 * rendered based on current register step
 */
const SignUp = () => {
  const currentStep = useAppSelector((state) => state.register.currentStep);
  return (
    <>
      {currentStep === 0 ? (
        <UserSignUp />
      ) : (
        <ProfileCreation title="Create your profile" />
      )}
    </>
  );
};
export default SignUp;
