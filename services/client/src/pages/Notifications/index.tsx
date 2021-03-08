import React, { Fragment, Suspense, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from 'react-query';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Box, Button } from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import ReplayIcon from '@material-ui/icons/Replay';

import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import NotificationCard from '../../components/NotifCard';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../../components/Loading';
import { useInfiniteNotifications } from '../../lib/hooks/notifs';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      margin: '4px 0',
      padding: theme.spacing(1, 0, 2),
    },
  })
);

export default function Messages() {
  const classes = useStyles();
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteNotifications();

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  return (
    <>
      <Header title='Notifications' back />
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary }) => (
              <Box mt={4} style={{ textAlign: 'center' }}>
                <Typography>An error occured</Typography>
                <Button
                  variant='outlined'
                  color='primary'
                  size='small'
                  startIcon={<ReplayIcon />}
                  onClick={() => resetErrorBoundary()}
                  style={{ marginRight: 8 }}
                >
                  Retry
                </Button>
              </Box>
            )}
          >
            <Suspense fallback={<CenteredLoading py={3} />}>
              <Paper square elevation={0} className={classes.paper}>
                <List disablePadding>
                  {data?.pages.map((page, i) => (
                    <Fragment key={i}>
                      {page.data.map((notif, idx) => (
                        <Fragment key={idx}>
                          <NotificationCard notif={notif} />
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </List>
              </Paper>
              <LoadMore
                fullWidth
                resource='posts'
                iconSize={18}
                ref={loadMoreRef}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={() => fetchNextPage()}
                style={{ textTransform: 'capitalize' }}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </>
  );
}
