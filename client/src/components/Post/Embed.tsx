import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { Box, Avatar, Link, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Post } from '../../types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

export default function EmbedPost({ post }: { post: Post['parent'] }) {
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
        src={post.author.profile.name}
        alt={post.author.profile.name}
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
            <small>{post.author.profile.name}</small>
          </Typography>
          <Typography
            color='textSecondary'
            variant='subtitle2'
            component='h6'
            noWrap
            style={{ marginLeft: 8 }}
          >
            <small>{`@${post.author.profile.username}`}</small>
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
