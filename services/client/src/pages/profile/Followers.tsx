import React, { Fragment, useRef, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from 'react-query';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ReplayIcon from '@material-ui/icons/Replay';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import FollowTab from '../../components/tabs/Follow';
import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import ProfileCard from '../../components/cards/ProfileCard';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../../components/Loading';
import { useInfiniteUsers, useUser } from '../../lib/hooks/auth';

export default function FollowersTab() {
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const { username } = useParams<{ username: string }>();
  const { data: user } = useUser(username);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers(`/users/${username}/followers`);

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  return (
    <>
      <Header
        back
        title={`${user?.profile.name}`}
        user={user}
        meta={`${user?.followers} followers`}
      />
      <FollowTab username={username} />
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
              {data?.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.data.map((followers, idx) => (
                    <Fragment key={idx}>
                      <ProfileCard
                        user={followers}
                        page={i}
                        cacheKey={`/users/${username}/followers`}
                      />
                    </Fragment>
                  ))}
                </Fragment>
              ))}
              <LoadMore
                fullWidth
                resource='followers'
                iconSize={24}
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
