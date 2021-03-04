import React, { useRef, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import PluginEditor from 'draft-js-plugins-editor';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FavoriteOutlinedIcon from '@material-ui/icons/FavoriteOutlined';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import ModeCommentOutlinedIcon from '@material-ui/icons/ModeCommentOutlined';

import CreatePostModal from '../modals/CreatePost';
import Dropdown from '../../components/dropdown/PostCard';
import { Post, Auth } from '../../types';
import { useDeletePost, useUpdatePostLike } from '../../lib/hooks/posts';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      marginTop: 4,
      padding: theme.spacing(2),
    },
    embed: {
      display: 'flex',
      borderRadius: 8,
      padding: theme.spacing(1),
      marginBottom: theme.spacing(1),
      backgroundColor: theme.palette.grey[100],
      border: `1px solid ${theme.palette.grey[400]}`,
    },
  })
);

interface IProps {
  cacheKey: string;
  page: number;
  post: Post;
}

export default function PostCard({ post, cacheKey, page }: IProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isModalOpen, setModal] = useState(false);
  const editorRef = useRef<PluginEditor>(null);
  const { pathname } = useLocation<string>();
  const classes = useStyles();
  const updateLike = useUpdatePostLike();
  const deletePost = useDeletePost();

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Paper elevation={0} component='article' className={classes.paper}>
      <Box display='flex' alignItems='center' mb={2}>
        <Link
          underline='none'
          to={`/${post.author.username}/profile`}
          component={RouterLink}
          style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}
        >
          <Avatar
            aria-label='avatar'
            src={post.author.avatar}
            alt={post.author.name}
          />
          <Box ml={1}>
            <Typography
              color='textPrimary'
              variant='subtitle2'
              component='h6'
              noWrap
            >
              {post.author.name}
            </Typography>
            <Typography
              color='textSecondary'
              variant='subtitle2'
              component='h6'
              noWrap
            >{`@${post.author.username}`}</Typography>
          </Box>
        </Link>
        <Box display='flex' alignItems='center' ml={1}>
          <Typography variant='subtitle2' component='h6'>
            {new Date(post.created_on).toLocaleDateString('en-gb', {
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
          <IconButton aria-label='dropdown' onClick={handleDropdownClick}>
            <ExpandMoreIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>
      {post.parent ? (
        <Body body={post.body} />
      ) : (
        <Link underline='none' to={`/posts/${post.id}`} component={RouterLink}>
          <Body body={post.body} />
        </Link>
      )}
      {post.parent && !pathname.split('/').includes('posts') && (
        <EmbedPost post={post.parent} />
      )}
      <Box display='flex' alignItems='center'>
        {!post.parent && (
          <IconButton
            aria-label='add comment'
            size='small'
            onClick={() => {
              setModal(true);
              editorRef.current?.focus();
            }}
            style={{ marginRight: 16 }}
          >
            <Typography variant='body2' style={{ marginRight: 4 }}>
              {post.comments}{' '}
            </Typography>
            <ModeCommentOutlinedIcon fontSize='small' />
          </IconButton>
        )}
        <IconButton
          aria-label='add to favorites'
          size='small'
          onClick={() =>
            updateLike.mutate({
              pageIndex: page,
              post_id: post.id,
              key: cacheKey,
            })
          }
        >
          <Typography variant='body2' style={{ marginRight: 4 }}>
            {post.likes}{' '}
          </Typography>
          {post.isLiked ? (
            <FavoriteOutlinedIcon color='primary' />
          ) : (
            <FavoriteBorderOutlinedIcon fontSize='small' />
          )}
        </IconButton>
      </Box>
      <Dropdown
        anchorEl={anchorEl}
        page={page}
        post={post}
        cacheKey={`/users/${post.author.username}/posts`}
        closeMenu={() => setAnchorEl(null)}
        deletePost={() => deletePost.mutate(post.id)}
      />
      <CreatePostModal
        post_id={post.id}
        editorRef={editorRef}
        cacheKey={cacheKey}
        isOpen={isModalOpen}
        handleClose={() => setModal(false)}
      />
    </Paper>
  );
}

function Body({ body }: { body: string }) {
  return body.match('({"blocks":)') ? (
    <Typography
      color='textPrimary'
      variant='subtitle1'
      component='p'
      gutterBottom
      dangerouslySetInnerHTML={{
        __html: stateToHTML(convertFromRaw(JSON.parse(body))),
      }}
    />
  ) : (
    <Typography
      color='textPrimary'
      variant='subtitle1'
      component='p'
      gutterBottom
    >
      {body}
    </Typography>
  );
}

function EmbedPost({ post }: { post: Post }) {
  const classes = useStyles();

  return (
    <Link
      underline='none'
      color='textPrimary'
      to={`/posts/${post.id}`}
      component={RouterLink}
      className={classes.embed}
    >
      <Avatar
        aria-label='avatar'
        src={post.author.avatar}
        alt={post.author.name}
        style={{ width: '24px', height: '24px' }}
      />
      <Box width='100%' mx={1}>
        <Box display='flex' alignItems='center' mb={1}>
          <Typography
            color='textPrimary'
            variant='subtitle2'
            component='h6'
            noWrap
          >
            <small>{post.author.name}</small>
          </Typography>
          <Typography
            color='textSecondary'
            variant='subtitle2'
            component='h6'
            noWrap
            style={{ marginLeft: 8 }}
          >
            <small>{`@${post.author.username}`}</small>
          </Typography>
        </Box>
        {post.body.match('(^{"blocks":)') ? (
          <Typography>
            <small
              dangerouslySetInnerHTML={{
                __html: stateToHTML(convertFromRaw(JSON.parse(post.body))),
              }}
            />
          </Typography>
        ) : (
          <Typography style={{ lineHeight: 1.2 }}>
            <small>{post.body}</small>
          </Typography>
        )}
      </Box>
    </Link>
  );
}
