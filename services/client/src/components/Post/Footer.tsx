import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosResponse, AxiosError } from 'axios';
import PluginEditor from '@draft-js-plugins/editor';
import { useMutation, useQueryClient } from 'react-query';
import { Box, IconButton } from '@material-ui/core';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import FavoriteOutlinedIcon from '@material-ui/icons/FavoriteOutlined';
import FavoriteBorderOutlinedIcon from '@material-ui/icons/FavoriteBorderOutlined';
import ModeCommentOutlinedIcon from '@material-ui/icons/ModeCommentOutlined';
import ShareIcon from '@material-ui/icons/Share';

import CreatePostModal from '../modals/CreatePost';
import DeleteModal from '../modals/DeletePost';
import Dropdown from '../dropdown/share';
import { APIError, Post } from '../../types';
import { useAuth } from '../../lib/hooks/user';
import { useDeletePost } from '../../lib/hooks/posts';

export default function PostFooter({
  post,
}: {
  post: Pick<Post, 'author' | 'isLiked' | 'id' | 'tags'>;
}) {
  const [isCreatePostModalOpen, setCreatePostModal] = useState(false);
  const [isDeleteModalOpen, setDeleteModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const editorRef = useRef<PluginEditor>(null);
  const { postId } = useParams<{ postId: string }>();
  const queryClient = useQueryClient();
  const deletePost = useDeletePost();
  const { data: user } = useAuth();

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

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

  return (
    <>
      <Box display='flex' alignItems='center' justifyContent='space-around'>
        <IconButton
          aria-label={post.isLiked ? 'unlike post' : 'like post'}
          onClick={() => updateLike.mutate(post.id)}
        >
          {post.isLiked ? (
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
          aria-label='share on social media'
          onClick={handleDropdownClick}
        >
          <ShareIcon fontSize='small' />
        </IconButton>
        {post.author.id === user?.id && (
          <IconButton
            aria-label='delete post'
            onClick={() => setDeleteModal(true)}
          >
            <DeleteOutlinedIcon fontSize='small' />
          </IconButton>
        )}
      </Box>
      <Dropdown
      url={`/posts/${post.id}`}
      tags={post.tags}
        anchorEl={anchorEl}
        closeMenu={() => setAnchorEl(null)}
      />
      <CreatePostModal
        editorRef={editorRef}
        isOpen={isCreatePostModalOpen}
        cacheKey={`/posts/${parseInt(postId)}/comments`}
        post_id={post.id}
        handleClose={() => setCreatePostModal(false)}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        handleClose={() => setDeleteModal(false)}
        deletePost={() => deletePost.mutate(post!.id)}
      />
    </>
  );
}
