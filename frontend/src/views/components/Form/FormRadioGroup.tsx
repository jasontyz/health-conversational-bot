/**
 * Author: Chi Zhang (z5211214)
 * Radio Group Component
 */
import React from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup, { RadioGroupProps } from '@mui/material/RadioGroup';
import { FormFieldContainer } from './FormComponents';
// import { omit } from 'lodash';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';

interface FormRadioGroupProps extends RadioGroupProps {
  /**
   * Name of the radio group
   */
  label: string;
}

/**
 * Component for radio group of profile creation page
 */
const FormRadioGroup = React.forwardRef<HTMLDivElement, FormRadioGroupProps>(
  (props: FormRadioGroupProps, ref) => (
    <FormFieldContainer>
      <FormControl
        fullWidth
        component="div"
        sx={{ flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <FormLabel component="p">{props.label}</FormLabel>
        <RadioGroup
          row
          sx={{
            justifyContent: 'space-around',
          }}
          ref={ref}
          {...props}
        >
          <FormControlLabel value="1" control={<Radio />} label="True" />
          <FormControlLabel value="0" control={<Radio />} label="False" />
          <FormControlLabel value="-1" control={<Radio />} label="Not sure" />
        </RadioGroup>
      </FormControl>
    </FormFieldContainer>
  ),
);
FormRadioGroup.displayName = 'FormLabeledRadio';
export default FormRadioGroup;
