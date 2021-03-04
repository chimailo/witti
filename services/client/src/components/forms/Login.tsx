import React from 'react';
import { Formik } from 'formik';
import {
  TextField,
  Button,
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { useLogin } from '../../lib/hooks/auth';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    field: {
      marginTop: theme.spacing(2),
    },
    button: {
      marginTop: '3rem',
      color: theme.palette.background.paper,
    },
  })
);

export default function LoginForm({
  handleSubmit,
}: {
  handleSubmit: () => void;
}) {
  const classes = useStyles();

  return (
    <Formik
      initialValues={{
        identity: '',
        password: '',
      }}
      onSubmit={async (values) => handleSubmit()}
    >
      {({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <TextField
            name='identity'
            label='Email or Username'
            type='text'
            className={classes.field}
            value={values.identity}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
          />
          <TextField
            name='password'
            label='Password'
            type='password'
            className={classes.field}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
          />
          <Button
            type='submit'
            color='primary'
            variant='contained'
            className={classes.button}
            disableElevation
            fullWidth
            disabled={isSubmitting}
          >
            Login
          </Button>
        </form>
      )}
    </Formik>
  );
}
