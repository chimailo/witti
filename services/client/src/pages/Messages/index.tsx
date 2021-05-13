import { useRef } from 'react';
import { useQueryClient } from 'react-query';
import Typography from '@material-ui/core/Typography';
import { Hidden, Grid, Box, Container, Paper } from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Head from '../../components/Head';
import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import Messages from '../../components/Messages';
import Sidebar from '../../components/Sidebar';
import { CenteredLoading } from '../../components/Loading';
import { KEYS } from '../../lib/constants';
import { useInfiniteMessages } from '../../lib/hooks/messages';
import { User } from '../../types';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    main: {
      [theme.breakpoints.up('sm')]: {
        marginLeft: 104,
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: 244,
      },
    },
    paper: {
      margin: '4px 0',
      overflow: 'auto',
      height: 'calc(100vh - 54px - 4px - 4px)',
      padding: theme.spacing(1, 0, 2),
    },
  })
);

export default function Message() {
  const classes = useStyles();
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const auth = queryClient.getQueryData<User>(KEYS.AUTH);
  const {
    data,
    error,
    isError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMessages();

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  return (
    <>
      <Head title='Chats' description={auth?.profile.name} />
      <Container maxWidth='xl' disableGutters>
      <Hidden xsDown>
        <Sidebar user={auth} />
      </Hidden>
      <div className={classes.main}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <Header title='Messages' back search />
            <Paper square elevation={0} className={classes.paper}>
              {isLoading ? (
                <CenteredLoading />
              ) : isError ? (
                <Box py={4}>
                  <Typography color='textSecondary' align='center'>
                    {error?.response?.data.message}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Messages data={data} />
                  <LoadMore
                    fullWidth
                    iconSize={24}
                    ref={loadMoreRef}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={() => fetchNextPage()}
                    style={{ textTransform: 'capitalize' }}
                  />
                </>
              )}
            </Paper>
          </Grid>
          <Hidden smDown>
            <Grid
              item
              xs={12}
              md={6}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant='h6'>
                Click on a chat to display it here.
              </Typography>
            </Grid>
          </Hidden>
        </Grid>
      </div>
    </Container>
    </>
  );
}
