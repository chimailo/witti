import React, { useEffect } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme } from '@material-ui/core';

import Logo from '../../components/logo';
import { CenteredLoading } from '../../components/Loading';
import { ROUTES } from '../../lib/constants';
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateUsername,
} from '../../lib/validators';
import { useAuth, useSignup } from '../../lib/hooks/auth';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      height: '100%',
      width: '100%',
      position: 'relative',
      '&:after': {
        content: '""',
        position: 'fixed',
        width: '100%',
        height: '70vh',
        zIndex: -1,
        top: 0,
        transformOrigin: 'left top',
        transform: 'skewY(-15deg)',
        backgroundColor: theme.palette.primary.main,
      },
    },
    paper: {
      width: '100%',
      padding: theme.spacing(3, 5),
      [theme.breakpoints.up('sm')]: {
        maxWidth: '500px',
        boxShadow: theme.shadows[3],
        padding: theme.spacing(5, 10),
        margin: theme.spacing(4, 'auto'),
      },
    },
    field: {
      marginTop: theme.spacing(2),
    },
    button: {
      marginTop: '3rem',
      color: theme.palette.background.paper,
    },
  })
);

export default function SignUp() {
  const classes = useStyles();
  const history = useHistory();
  const { data, status } = useAuth();
  const mutation = useSignup();

  const loggedIn = data && localStorage.getItem('token');

  useEffect(() => {
    if (loggedIn) {
      history.replace(ROUTES.HOME);
    }
  }, [loggedIn]);

  if (loggedIn) return <CenteredLoading height='100vh' />;

  return (
    <>
      {status === 'loading' ? (
        <CenteredLoading height='100vh' />
      ) : (
        <div className={classes.wrapper}>
          <Grid container alignItems='center' justify='center'>
            <Grid item xs={12} sm={8} md={6} component='main'>
              <Paper color='primary' elevation={0} className={classes.paper}>
                <Box textAlign='center'>
                  <Logo />
                </Box>
                <Typography
                  component='p'
                  variant='h6'
                  align='center'
                  className={classes.field}
                  noWrap
                >
                  Create your account.
                </Typography>
                <Formik
                  initialValues={{
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    password2: '',
                  }}
                  validateOnChange={false}
                  validationSchema={Yup.object({
                    name: validateName(),
                    username: validateUsername(),
                    email: validateEmail(),
                    password: validatePassword(),
                    password2: validatePasswordConfirm(),
                  })}
                  onSubmit={async (values) => mutation.mutate(values)}
                >
                  {({
                    values,
                    touched,
                    errors,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                  }) => (
                    <form onSubmit={handleSubmit}>
                      <TextField
                        name='name'
                        label='Your name'
                        type='text'
                        className={classes.field}
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText={errors.name && touched.name && errors.name}
                        error={!!(errors.name && touched.name)}
                        fullWidth
                      />
                      <TextField
                        name='username'
                        label='Username'
                        type='text'
                        className={classes.field}
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText={
                          errors.username && touched.username && errors.username
                        }
                        error={!!(errors.username && touched.username)}
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
                  )}
                </Formik>
                <Typography
                  variant='body2'
                  style={{ marginTop: '2rem' }}
                  gutterBottom
                >
                  Already have an account?
                  <Link
                    component={RouterLink}
                    to={ROUTES.LOGIN}
                    color='primary'
                  >
                    <strong> Login here.</strong>
                  </Link>
                </Typography>
                <Typography variant='body2' paragraph>
                  By clicking the sign up button, you agree to our
                  <Link
                    component={RouterLink}
                    to={ROUTES.TERMS}
                    color='primary'
                  >
                    {' terms'}
                  </Link>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </div>
      )}
    </>
  );
}
