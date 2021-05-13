import { useRef, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Divider } from '@material-ui/core';
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
import { useAuth } from '../../lib/hooks/user';
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
  const { data: post, isLoading, isError, error } = usePost(parseInt(postId));
  const { data: user } = useAuth();

  const {
    data: comments,
    error: commentsError,
    isLoading: commentsLoading,
    isError: commentsIsError,
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
    <Page title='Post'>
      <Header back title='Post' user={user} />
      <Paper
        elevation={0}
        component='article'
        style={{
          marginTop: 4,
          padding: theme.spacing(2),
        }}
      >
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
            {post && (
              <>
                <PostHeader post={post} />
                <PostContent post={post} postPage />
                <PostPageMeta post={post} />
                <Divider />
                <PostFooter post={post} />
              </>
            )}
          </>
        )}
      </Paper>
      {commentsLoading ? (
        <CenteredLoading />
      ) : commentsIsError ? (
        <Box py={4}>
          <Typography color='textSecondary' align='center'>
            {commentsError?.response?.data.message}
          </Typography>
        </Box>
      ) : (
        <>
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
        </>
      )}
    </Page>
  );
}
