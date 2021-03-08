import React, { useState, useRef, Fragment, Suspense } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import axios, { AxiosResponse, AxiosError } from 'axios';
import PluginEditor from 'draft-js-plugins-editor';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { ErrorBoundary } from 'react-error-boundary';
import {
  useMutation,
  useQueryClient,
  useQueryErrorResetBoundary,
} from 'react-query';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Avatar, Divider, IconButton, useMediaQuery } from '@material-ui/core';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FavoriteOutlinedIcon from '@material-ui/icons/FavoriteOutlined';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import ModeCommentOutlinedIcon from '@material-ui/icons/ModeCommentOutlined';
import ReplayIcon from '@material-ui/icons/Replay';
import TwitterIcon from '@material-ui/icons/Twitter';
import { useTheme } from '@material-ui/core/styles';

import CreatePostModal from '../../components/modals/CreatePost';
import DeleteModal from '../../components/modals/DeletePost';
import DropDown from '../../components/dropdown/PostCard';
import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import PostCard from '../../components/cards/PostCard';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { APIError, Post } from '../../types';
import { CenteredLoading } from '../../components/Loading';
import { useAuth } from '../../lib/hooks/auth';
import {
  useDeletePost,
  useInfinitePosts,
  usePost,
} from '../../lib/hooks/posts';

export default function PostPage() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCreatePostModalOpen, setCreatePostModal] = useState(false);
  const [isDeleteModalOpen, setDeleteModal] = useState(false);
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<PluginEditor>(null);

  const theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const { postId } = useParams<{ postId: string }>();
  const { data: post } = usePost(parseInt(postId));
  const { data: user } = useAuth();
  const deletePost = useDeletePost();
  const queryClient = useQueryClient();
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

  const updateLike = useMutation(
    async (postId: number) => {
      const res: AxiosResponse<Post> = await axios.post(
        `/posts/${postId}/likes`
      );
      return res.data;
    },
    {
      onMutate: (postId: number) => {
        // @ts-expect-error
        return queryClient.setQueryData<Post>(`/posts/${postId}`, (post) => {
          if (post) {
            console.log(post);
            if (post.isLiked) {
              post.likes = post.likes - 1;
              post.isLiked = false;
            } else {
              post.likes = post.likes + 1;
              post.isLiked = true;
            }
          }
          // console.log(post);
          return post;
        });
      },
      onError: (error: AxiosError<APIError>) => {
        console.log('Error: ', error.message);
        // to error reporting service
      },
      onSettled: () => queryClient.invalidateQueries(['posts', postId]),
    }
  );

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  return (
    <>
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
            <Box display='flex' alignItems='center' mb={2}>
              <Link
                underline='none'
                to={`/${post?.author.username}/profile`}
                component={RouterLink}
                style={{
                  display: 'flex',
                  flexGrow: 1,
                  alignItems: 'center',
                }}
              >
                <Avatar
                  aria-label='avatar'
                  src={post?.author.avatar}
                  alt={post?.author.name}
                />
                <Box ml={1}>
                  <Typography
                    color='textPrimary'
                    variant='subtitle2'
                    component='h6'
                    noWrap
                  >
                    {post?.author.name}
                  </Typography>
                  <Typography
                    color='textSecondary'
                    variant='subtitle2'
                    component='h6'
                    noWrap
                  >{`@${post?.author.username}`}</Typography>
                </Box>
              </Link>
              <Box display='flex' alignItems='center'>
                <IconButton aria-label='dropdown' onClick={handleDropdownClick}>
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
            </Box>
            {post?.body.match('(^{"blocks":)') ? (
              <Typography
                color='textPrimary'
                variant={xsDown ? 'subtitle1' : 'h6'}
                component='p'
                gutterBottom
                dangerouslySetInnerHTML={{
                  __html: stateToHTML(convertFromRaw(JSON.parse(post?.body))),
                }}
              />
            ) : (
              <Typography
                color='textPrimary'
                variant={xsDown ? 'subtitle1' : 'h6'}
                component='p'
                gutterBottom
              >
                {post?.body}
              </Typography>
            )}
            <Box
              flexWrap='wrap'
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              my={2}
            >
              <Box display='flex' alignItems='center'>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  <strong>{post?.likes}</strong>{' '}
                  {post?.likes === 1 ? 'like' : 'likes'}
                </Typography>
                <Typography
                  variant='body2'
                  color='textSecondary'
                  gutterBottom
                  style={{ marginLeft: 16 }}
                >
                  <strong>{post?.comments}</strong>{' '}
                  {post?.comments === 1 ? 'comment' : 'comments'}
                </Typography>
              </Box>
              <Typography color='textSecondary' component='span'>
                <small>
                  {post &&
                    new Date(post?.created_on).toLocaleTimeString('en-gb', {
                      hour12: true,
                      hour: 'numeric',
                      weekday: 'long',
                      minute: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                </small>
              </Typography>
            </Box>
            <Divider />
            <Box
              display='flex'
              alignItems='center'
              justifyContent='space-around'
            >
              <IconButton
                aria-label='Like/unlike post'
                onClick={() => updateLike.mutate(post!.id)}
              >
                {post?.isLiked ? (
                  <FavoriteOutlinedIcon color='primary' />
                ) : (
                  <FavoriteBorderOutlinedIcon fontSize='small' />
                )}
              </IconButton>
              <IconButton
                aria-label='add comment'
                onClick={() => {
                  setCreatePostModal(true);
                  editorRef.current?.focus();
                }}
              >
                <ModeCommentOutlinedIcon fontSize='small' />
              </IconButton>
              <IconButton
                aria-label='share on twitter'
                // onClick={() => updatePostLike(id)}
              >
                <TwitterIcon fontSize='small' />
              </IconButton>
              {post?.author.id === user?.id && (
                <IconButton
                  aria-label='delete post'
                  onClick={() => setDeleteModal(true)}
                >
                  <DeleteOutlinedIcon fontSize='small' />
                </IconButton>
              )}
            </Box>
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
                  <PostCard
                    post={comment}
                    page={i}
                    cacheKey={`/posts/${parseInt(postId)}/comments`}
                  />
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
      <CreatePostModal
        editorRef={editorRef}
        isOpen={isCreatePostModalOpen}
        cacheKey={`/posts/${parseInt(postId)}/comments`}
        post_id={post?.id}
        handleClose={() => setCreatePostModal(false)}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        handleClose={() => setDeleteModal(false)}
        deletePost={() => deletePost.mutate(post!.id)}
      />
      {post && (
        <DropDown
          anchorEl={anchorEl}
          closeMenu={() => setAnchorEl(null)}
          post={post}
          cacheKey={`/posts/${parseInt(postId)}`}
          deletePost={() => deletePost.mutate(post!.id)}
        />
      )}
    </>
  );
}
