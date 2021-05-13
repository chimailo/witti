import React, { useRef, useState } from 'react';
import PluginEditor from '@draft-js-plugins/editor';
import { Box, Typography, IconButton } from '@material-ui/core';
import FavoriteOutlinedIcon from '@material-ui/icons/FavoriteOutlined';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import ModeCommentOutlinedIcon from '@material-ui/icons/ModeCommentOutlined';
import ShareIcon from '@material-ui/icons/Share';
import CreatePostModal from '../modals/CreatePost';
import Dropdown from '../dropdown/share';
import { Post } from '../../types';
import { useUpdatePostLike } from '../../lib/hooks/posts';

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//   })
// );

interface PostMetaProps {
  post: Post;
  page: number;
  cacheKey: string | any[];
}

export default function PostMeta({ post, page, cacheKey }: PostMetaProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isModalOpen, setModal] = useState(false);
  const editorRef = useRef<PluginEditor>(null);
  //   const classes = useStyles();
  const updateLike = useUpdatePostLike();

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Box display='flex' alignItems='center' justifyContent='space-around'>
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
            <Typography style={{ marginRight: 4 }}>
              <small>{post.comments}</small>
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
          <Typography style={{ marginRight: 4 }}>
            <small>{post.likes}</small>
          </Typography>
          {post.isLiked ? (
            <FavoriteOutlinedIcon color='primary' />
          ) : (
            <FavoriteBorderOutlinedIcon fontSize='small' />
          )}
        </IconButton>
        <IconButton
          aria-label='share on social media'
          size='small'
          onClick={handleDropdownClick}
        >
          <ShareIcon fontSize='small' />
        </IconButton>
      </Box>
      <Dropdown
      url={`/posts/${post.id}`}
      tags={post.tags}
        anchorEl={anchorEl}
        closeMenu={() => setAnchorEl(null)}
      />
      <CreatePostModal
        post_id={post.id}
        editorRef={editorRef}
        cacheKey={cacheKey}
        isOpen={isModalOpen}
        handleClose={() => setModal(false)}
      />
    </>
  );
}

export function PostPageMeta({
  post,
}: {
  post: Pick<Post, 'created_on' | 'comments' | 'likes'>;
}) {
  return (
    <Box
      flexWrap='wrap'
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      my={2}
    >
      <Box display='flex' alignItems='center'>
        <Typography variant='body2' color='textSecondary' gutterBottom>
          <strong>{post?.likes}</strong> {post?.likes === 1 ? 'like' : 'likes'}
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
      <Typography color='textSecondary' component='span' gutterBottom>
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
  );
}
