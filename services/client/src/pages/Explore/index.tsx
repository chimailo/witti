import React, { Fragment, Suspense, useRef, useState } from 'react';
import { QueryErrorResetBoundary } from 'react-query';
import { ErrorBoundary } from 'react-error-boundary';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ReplayIcon from '@material-ui/icons/Replay';

import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import Page from '../../components/Page';
import PostCard from '../../components/cards/PostCard';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../../components/Loading';
import { KEYS } from '../../lib/constants';
import { useInfinitePosts } from '../../lib/hooks/posts';

export default function Home() {
  const [feed, setFeed] = useState('latest');
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const key = feed === 'latest' ? KEYS.EXPLORE_LATEST : KEYS.EXPLORE_TOP;
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(key, `/posts/explore?feed=${feed}`);

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  const handleFeedChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFeed(event.target.value as string);
  };

  return (
    <Page key={key}>
      <Header
        back
        title='Explore'
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
                      <PostCard post={post} page={i} cacheKey={key} />
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
    </Page>
  );
}