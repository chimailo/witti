import React, { useEffect } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import FormatQuoteRoundedIcon from '@material-ui/icons/FormatQuoteRounded';
import {
  makeStyles,
  Theme,
  createStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import hero from '../../static/images/hero1.jpg';
import Logo from '../../components/logo';
import { CenteredLoading } from '../../components/Loading';
import { ROUTES } from '../../lib/constants';
import { useAuth } from '../../lib/hooks/auth';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'relative',
      height: '100vh',
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'column',
      '&:after': {
        top: 0,
        left: 0,
        content: '""',
        zIndex: -1,
        width: '100%',
        height: '100vh',
        display: 'block',
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
    },
    imgContainer: {
      width: '100%',
      height: '100vh',
      position: 'absolute',
      zIndex: -1,
      top: 0,
      left: 0,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    margin: {
      [theme.breakpoints.up('sm')]: {
        margin: theme.spacing(1),
      },
    },
    main: {
      textAlign: 'center',
      justifyContent: 'center',
      padding: theme.spacing(0, 2),
    },
    color: {
      color: theme.palette.background.paper,
    },
    sample: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      padding: theme.spacing(2, 0),
      marginTop: theme.spacing(8),
    },
    sampleText: {
      padding: theme.spacing(0, 1),
      color: theme.palette.grey[300],
      [theme.breakpoints.up('md')]: {
        maxWidth: '75%',
        margin: 'auto',
      },
    },
  })
);

export default function Landing() {
  const classes = useStyles();
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));
  const history = useHistory();
  const { data, status } = useAuth();
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
        <div className={classes.root}>
          <div className={classes.imgContainer}>
            <img src={hero} alt='Logo' className={classes.image} />
          </div>
          <AppBar color='transparent' elevation={0}>
            <Container maxWidth='lg'>
              <Toolbar
                component='nav'
                disableGutters
                style={{ justifyContent: 'space-between' }}
              >
                <Logo />
                <div>
                  <Button
                    variant='outlined'
                    color='secondary'
                    component={RouterLink}
                    to={ROUTES.SIGNUP}
                    className={classes.margin}
                  >
                    Sign up
                  </Button>
                  <Button
                    color='secondary'
                    component={RouterLink}
                    to={ROUTES.LOGIN}
                    className={classes.margin}
                  >
                    Login
                  </Button>
                </div>
              </Toolbar>
            </Container>
          </AppBar>
          <Grid container justify='center'>
            <Grid
              item
              xs={12}
              sm={10}
              md={8}
              component='main'
              className={classes.main}
            >
              <Typography
                align='center'
                variant={matchesXs ? 'h4' : 'h3'}
                component='h1'
                className={classes.color}
                gutterBottom
              >
                Want to see something funny?
              </Typography>
              <Typography
                component='h6'
                align='center'
                className={classes.color}
                paragraph
              >
                Join millions of others and share your funny moments.
              </Typography>
              <Button
                size='large'
                variant='outlined'
                color='primary'
                component={RouterLink}
                to={ROUTES.SIGNUP}
              >
                Join for free.
              </Button>
            </Grid>
            <Grid item xs={12}>
              <section className={classes.sample}>
                <Typography
                  component='p'
                  align='center'
                  className={classes.sampleText}
                >
                  <FormatQuoteRoundedIcon />
                  Nostradamus real name was Nostrildamus but he changed it at
                  the age of 42 after no one was taking him seriously
                  <FormatQuoteRoundedIcon />
                </Typography>
                <Typography
                  variant='subtitle2'
                  align='center'
                  component='p'
                  className={classes.sampleText}
                >
                  Skynet Jr.
                </Typography>
              </section>
            </Grid>
          </Grid>
        </div>
      )}
    </>
  );
}
