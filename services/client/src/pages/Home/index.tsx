import React, { Fragment, Suspense, useRef, useState } from 'react';
import { QueryErrorResetBoundary } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ReplayIcon from '@material-ui/icons/Replay';

import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import PostCard from '../../components/cards/PostCard';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../../components/Loading';
import { KEYS } from '../../lib/constants';
import { useAuth } from '../../lib/hooks/auth';
import { useInfinitePosts } from '../../lib/hooks/posts';

export default function Home() {
  const [feed, setFeedType] = useState('latest');
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const { data: user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(KEYS.FEED, `/posts?feed=${feed}`);

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  const handleFeedChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFeedType(event.target.value as string);
  };

  return (
    <>
      <Header
        avatar
        title='home'
        user={user}
        feed={feed}
        handleFeedChange={handleFeedChange}
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
              {data?.pages.map((page, i) => (
                <Fragment key={i}>
                  {page.data.map((post, idx) => (
                    <Fragment key={idx}>
                      <PostCard post={post} page={i} cacheKey={KEYS.FEED} />
                    </Fragment>
                  ))}
                </Fragment>
              ))}
              <LoadMore
                fullWidth
                resource='posts'
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
