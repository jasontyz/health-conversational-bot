/**
 * Author: Chi Zhang (z5211214)
 * Frontend busines logic for user sign up page
 */
import { createSlice } from '@reduxjs/toolkit';

/** Typings for state of register slice */
interface RegisterSliceState {
  currentStep: number;
}

/** Initial state for the slice */
const registerSliceState: RegisterSliceState = {
  currentStep: 0,
};

/** Slice for redux slice */
const registerSlice = createSlice({
  name: 'register',
  initialState: registerSliceState,
  reducers: {
    // proceed to next step
    nextStep: (state) => {
      if (state.currentStep === 0) {
        state.currentStep += 1;
      }
    },
    // Back to the previous step
    prevStep: (state) => {
      if (state.currentStep === 1) {
        state.currentStep -= 1;
      }
    },
  },
});

export default registerSlice.reducer;
export const { nextStep, prevStep } = registerSlice.actions;
