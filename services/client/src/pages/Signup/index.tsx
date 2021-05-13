import { useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup'
import {Link as RouterLink} from 'react-router-dom';
import { useHistory } from 'react-router';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme, useTheme } from '@material-ui/core';

import Head from '../../components/Head';
import Logo from '../../components/svg/logo';
import { CenteredLoading } from '../../components/Loading';
import { ROUTES } from '../../lib/constants';
import { SignupForm } from '../../components/forms';
import { useAuth, useSignup } from '../../lib/hooks/user';
import { validateName, validateUsername, validateEmail, validatePassword, validatePasswordConfirm } from '../../lib/validators';

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

export default function Signup() {
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const {mutate, error, isError} = useSignup()
  const { data, status } = useAuth();

  const loggedIn = data && localStorage.getItem('token');

  useEffect(() => {
    if (loggedIn) {
      history.replace(ROUTES.EXPLORE);
    }
  }, [history, loggedIn]);

  if (loggedIn) return <CenteredLoading height='100vh' />;

  return (
    <>
      <Head title='Sign up' />
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
    {isError && (
      <Box my={2} p={1} bgcolor={theme.palette.grey[100]}>
        <Typography
          color='error'
          variant='subtitle1'
          align='center'
        >
          {error?.response?.data.message}
        </Typography>
      </Box>
    )}
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
      onSubmit={async (values) => mutate(values)}
    >
    {(props) => (<SignupForm formik={props} />)}
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
