import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';

interface TagFormProps {
  value: string;
  errors?: any[];
  handleChange: (e: any) => void;
  handleSubmit: (e: any) => void;
}

export default function TagForm(props: TagFormProps) {
  const [touched, setTouched] = useState(false);
  const { errors, value, handleChange, handleSubmit } = props;

  return (
    <form style={{ width: '100%' }} onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label='Tags'
        name='tag'
        placeholder='Enter tag name and press enter'
        type='text'
        color='primary'
        value={value}
        onChange={handleChange}
        error={touched && errors && errors.length > 0}
        onFocus={() => setTouched(true)}
        onBlur={() => setTouched(false)}
        helperText={
          touched && errors
            ? errors.length === 1
              ? errors[0]
              : errors.join(', ')
            : "Don't forget to tag your post, it increases it's visibilty"
        }
      />
    </form>
  );
}
