import React, { Fragment, useRef, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from 'react-query';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ReplayIcon from '@material-ui/icons/Replay';

import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import Page from '../../components/Page';
import PostCard from '../../components/cards/PostCard';
import ProfileCard from '../../components/cards/ProfileCard';
import ProfileTab from '../../components/tabs/Profile';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../../components/Loading';
import { KEYS } from '../../lib/constants';
import { useInfinitePosts } from '../../lib/hooks/posts';
import { useUser } from '../../lib/hooks/auth';

export default function FavoritesTab() {
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const { username } = useParams<{ username: string }>();
  const { data: user } = useUser(username);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(`/users/${username}/likes`, `/users/${username}/likes?`);

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  return (
    <Page>
      <Header
        back
        title={`${user?.profile.name}`}
        user={user}
        meta={`${data?.pages[0].total} likes`}
      />
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
              {user && (
                <ProfileCard
                  user={user}
                  cacheKey={[KEYS.USER, user.auth.username]}
                />
              )}
              <ProfileTab username={user?.auth.username} />
              {data?.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.data.map((likes, idx) => (
                    <Fragment key={idx}>
                      <PostCard
                        post={likes}
                        page={i}
                        cacheKey={`/users/${username}/likes`}
                      />
                    </Fragment>
                  ))}
                </Fragment>
              ))}
              <LoadMore
                fullWidth
                resource='replies'
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
    </Page>
  );
}
