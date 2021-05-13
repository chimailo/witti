import { FormikProps } from 'formik';
import { TextField, Button } from '@material-ui/core';
import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';

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

export default function LoginForm({formik}: {formik: FormikProps<{
  email: string;
  password: string;
}>}) {
  const classes = useStyles();
  const {values,
    isSubmitting,
    handleChange,
    handleBlur,
  handleSubmit} = formik

  return (
          <form onSubmit={handleSubmit}>
            <TextField
              name='email'
              label='Email'
              type='text'
              className={classes.field}
              value={values.email}
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
  );
}
