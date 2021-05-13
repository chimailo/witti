import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Avatar, Link, Typography, IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Dropdown from '../dropdown/PostCard';
import { Post } from '../../types';
import { useDeletePost } from '../../lib/hooks/posts';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    link: {
      display: 'flex',
      flexGrow: 1,
      alignItems: 'center',
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

interface PostHeaderProps {
  post: Post;
  page?: number;
}

export default function PostHeader({ post, page }: PostHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const classes = useStyles();
  const deletePost = useDeletePost();

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Box display='flex' alignItems='center' mb={2}>
        <Link
          underline='none'
          to={`/${post.author.username}`}
          component={RouterLink}
          className={classes.link}
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
          <Typography variant='subtitle2' component='h6' noWrap>
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
      <Dropdown
        anchorEl={anchorEl}
        page={page}
        post={post}
        cacheKey={`/users/${post.author.username}/posts`}
        closeMenu={() => setAnchorEl(null)}
        deletePost={() => deletePost.mutate(post.id)}
      />
    </>
  );
}
