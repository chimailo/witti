import React, { useEffect } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios, { AxiosResponse } from 'axios';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import SwipeableViews from 'react-swipeable-views';
import Toolbar from '@material-ui/core/Toolbar';
import { autoPlay } from 'react-swipeable-views-utils';
import {
  makeStyles,
  Theme,
  createStyles,
  Typography,
  useMediaQuery,
  useTheme,
  SvgIcon,
  Box,
} from '@material-ui/core';

import hero from '../../hero.jpg';
import Logo from '../../components/svg/logo';
import { CenteredLoading } from '../../components/Loading';
import {Body} from '../../components/Post/Content'
import { ROUTES } from '../../lib/constants';
import { Post } from '../../types';
import { QuoteIcon } from '../../components/svg';
import { useAuth } from '../../lib/hooks/user';

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
        margin: theme.spacing(0, 1),
      },
    },
    main: {
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    sample: {
      width: '100%',
      minHeight: 120,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      padding: theme.spacing(3, 0),
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

  const { data: posts, isLoading, isError } = useQuery(
    'featured-posts',
    async () => {
      const res: AxiosResponse<Post[]> = await axios.get(`/posts/featured`);
      return res.data;
    }
  );

  useEffect(() => {
    if (loggedIn) {
      history.replace(ROUTES.HOME);
    }
  }, [history, loggedIn]);

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
          <Container maxWidth='md'>
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
        <Box
          height={400}
          component='main'
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
        >
          <Container maxWidth='sm' className={classes.main}>
            <Typography
              align='center'
              variant={matchesXs ? 'h4' : 'h3'}
              component='h1'
              color='secondary'
              gutterBottom
            >
              Want to see something funny?
            </Typography>
            <Typography
              component='h6'
              align='center'
              color='secondary'
              paragraph
            >
              Join in the fun and share your funny moments.
            </Typography>
            <Button
              size='large'
              variant='outlined'
              color='primary'
              component={RouterLink}
              to={ROUTES.SIGNUP}
              style={{ margin: 'auto' }}
            >
              Join for free.
            </Button>
          </Container>
          <section className={classes.sample}>
            <Container maxWidth='sm'>
              {isLoading && <CenteredLoading />}
              {isError && (
                <Typography component='p' align='center'>
                  An error occured
                </Typography>
              )}
              {posts && <FeaturedPostsCarousel posts={posts} />}
            </Container>
          </section>
        </Box>
      </div>
      )}
    </>
  );
}

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

function FeaturedPostsCarousel({ posts }: { posts: Post[] }) {
  const [activePost, setActivePost] = React.useState(0);
  const theme = useTheme();
  const handleStepChange = (step: number) => {
    setActivePost(step);
  };

  return (
    <AutoPlaySwipeableViews
      enableMouseEvents
      axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
      index={activePost}
      onChangeIndex={handleStepChange}
      interval={7000}
    >
      {posts.map((post) => (
        <>
          <Typography
            color='secondary'
            component='p'
            align='center'
            paragraph
            style={{ padding: theme.spacing(0, 2) }}
          >
            <SvgIcon
              component={QuoteIcon}
              viewBox='0 0 508 508'
              color='secondary'
              fontSize='small'
              style={{
                marginRight: theme.spacing(2),
              }}
            />
            <Body post={post.body} dark />
          </Typography>
          <Typography
            variant='subtitle2'
            align='right'
            color='secondary'
            component='p'
          >
            - { // @ts-expect-error
             post.author.profile.username}
          </Typography>
        </>
      ))}
    </AutoPlaySwipeableViews>
  );
}
