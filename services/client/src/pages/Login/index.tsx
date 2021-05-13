import { useEffect } from 'react';
import {
  Link as RouterLink,
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';
import { StaticContext, useHistory } from 'react-router';
import { Formik } from 'formik';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme, useTheme } from '@material-ui/core';

import Head from '../../components/Head';
import LoginForm from '../../components/forms/Login';
import Logo from '../../components/svg/logo';
import { CenteredLoading } from '../../components/Loading';
import { ROUTES } from '../../lib/constants';
import { useAuth } from '../../lib/hooks/user';
import { useLogin } from '../../lib/hooks/user';

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

function Login(
  props: RouteComponentProps<{}, StaticContext, { from: { pathname: string } }>
) {
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();
  const { data, status } = useAuth();
  const { mutate, isError, error } = useLogin();

  const loggedIn = data && localStorage.getItem('token');
  const { from } = props.location.state || {
    from: { pathname: ROUTES.LANDING },
  };

  console.log(loggedIn)
  useEffect(() => {
    if (loggedIn) {
      history.replace(from);
    }
  }, [from, history, loggedIn]);

  if (loggedIn) return <CenteredLoading height='100vh' />;

  return (
    <>
      <Head title='Login' />
      {status === 'loading' ? (
        <CenteredLoading height='100vh' />
      ) : (
    <div className={classes.wrapper}>
      <Grid
        container
        alignItems='center'
        justify='center'
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={12} sm={8} md={6} component='main'>
          <Paper color='primary' elevation={0} className={classes.paper}>
            <Box textAlign='center'>
              <Logo />
            </Box>
            <Typography component='p' variant='h6' align='center' noWrap>
              Log in to your account.
            </Typography>
            {/* <LoginForm /> */}
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
          email: '',
          password: '',
        }}
        onSubmit={async (values) => mutate(values)}
        >
        {(props) => <LoginForm formik={props} />}
        </Formik>
            <Typography
              variant='body2'
              style={{ marginTop: '2rem' }}
              gutterBottom
            >
              Don't have an account?
              <Link component={RouterLink} to={ROUTES.SIGNUP} color='primary'>
                <strong> Sign up here.</strong>
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

export default withRouter(Login);
