import React, { useRef, Fragment, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from 'react-query';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Divider } from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';

import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import Page from '../../components/Page';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../../components/Loading';
import {
  PostHeader,
  PostContent,
  PostPageMeta,
  PostFooter,
  PostMeta,
} from '../../components/Post';
import { useAuth } from '../../lib/hooks/auth';
import { useInfinitePosts, usePost } from '../../lib/hooks/posts';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      marginTop: 4,
      padding: theme.spacing(2),
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(2, 1),
      },
    },
  })
);

export default function PostPage() {
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  const theme = useTheme();
  const classes = useStyles();
  const { postId } = useParams<{ postId: string }>();
  const { data: post } = usePost(parseInt(postId));
  const { data: user } = useAuth();
  const { reset } = useQueryErrorResetBoundary();

  const {
    data: comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(
    `/posts/${postId}/comments`,
    `/posts/${postId}/comments?`
  );

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  return (
    <Page>
      <Header back title='Post' user={user} />
      <Paper
        elevation={0}
        component='article'
        style={{
          marginTop: 4,
          padding: theme.spacing(2),
        }}
      >
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
            {post && (
              <>
                <PostHeader post={post} />
                <PostContent post={post} postPage />
                <PostPageMeta post={post} />
                <Divider />
                <PostFooter post={post} />
              </>
            )}
          </Suspense>
        </ErrorBoundary>
      </Paper>
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
          {comments?.pages.map((page, i) => (
            <Fragment key={i}>
              {page.data.map((comment, idx) => (
                <Fragment key={idx}>
                  <Paper
                    elevation={0}
                    component='article'
                    className={classes.paper}
                  >
                    <PostHeader post={comment} page={i} />
                    <PostContent post={comment} />
                    <PostMeta
                      post={comment}
                      page={i}
                      cacheKey={`/posts/${parseInt(postId)}/comments`}
                    />
                  </Paper>
                </Fragment>
              ))}
            </Fragment>
          ))}
          <LoadMore
            fullWidth
            resource='comments'
            iconSize={24}
            ref={loadMoreRef}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={() => fetchNextPage()}
            style={{ textTransform: 'capitalize' }}
          />
        </Suspense>
      </ErrorBoundary>
    </Page>
  );
}
