import { FormikProps } from 'formik';
import { Button, TextField } from '@material-ui/core';
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

export default function SignupForm({formik}: {formik: FormikProps<{
  name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
}>}) {
  const classes = useStyles();
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = formik
  
  return (
      <form onSubmit={handleSubmit}>
        <TextField
          name='name'
          label='Your Name'
          type='name'
          className={classes.field}
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          helperText={
            errors.name && touched.name && errors.name
          }
          error={!!(touched.name && errors.name)}
          fullWidth
        />
        <TextField
          name='username'
          label='Username'
          type='username'
          className={classes.field}
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          helperText={
            errors.username && touched.username && errors.username
          }
          error={!!(touched.username && errors.username)}
          fullWidth
        />
          <TextField
            name='email'
            label='Email'
            type='email'
            className={classes.field}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            helperText={
              errors.email && touched.email && errors.email
            }
            error={!!(touched.email && errors.email)}
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
            helperText={
              errors.password && touched.password && errors.password
            }
            error={!!(touched.password && errors.password)}
            fullWidth
          />
          <TextField
            name='password2'
            label='Confirm Your Password'
            type='password'
            className={classes.field}
            value={values.password2}
            onChange={handleChange}
            onBlur={handleBlur}
            helperText={
              errors.password2 &&
              touched.password2 &&
              errors.password2
            }
            error={!!(touched.password2 && errors.password2)}
            fullWidth
          />
          <Button
            type='submit'
            color='primary'
            variant='contained'
            className={classes.button}
            disabled={isSubmitting}
            disableElevation
            fullWidth
          >
            Sign Up
          </Button>
          </form>
  )
}
