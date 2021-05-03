import React, { Fragment, useRef } from 'react';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import NotificationCard from '../../components/NotifCard';
import Page from '../../components/Page';
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

export default function Notifications() {
  const classes = useStyles();
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const {
    data,
    error,
    isError,
    isLoading,
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
    <Page>
      <Header back title='Notifications' />
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
            iconSize={16}
            ref={loadMoreRef}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={() => fetchNextPage()}
            style={{ textTransform: 'capitalize' }}
          />
        </>
      )}
    </Page>
  );
}
