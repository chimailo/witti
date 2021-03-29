import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { Box, Link, Typography } from '@material-ui/core';
import EmbedPost from './Embed';
import { Post } from '../../types';

interface PostContentProps {
  post: Post;
  postPage?: boolean;
}

export default function PostContent({ post, postPage }: PostContentProps) {
  const { pathname } = useLocation<string>();

  return (
    <>
      {post.parent ? (
        <Body post={post.body} />
      ) : postPage ? (
        <Body post={post.body} postPage />
      ) : (
        <Link underline='none' to={`/posts/${post.id}`} component={RouterLink}>
          <Body post={post.body} />
        </Link>
      )}
      {post.parent && !pathname.split('/').includes('posts') && (
        <EmbedPost post={post.parent} />
      )}
      <Box flexWrap='wrap' display='flex' alignItems='center' mb={2}>
        {post?.tags.map((tag) => (
          <Link
            color='textSecondary'
            key={tag.id}
            to={`/explore/${tag.name}`}
            component={RouterLink}
            style={{ marginRight: 8 }}
          >{`#${tag.name}`}</Link>
        ))}
      </Box>
    </>
  );
}

function Body({ post, postPage }: { post: string; postPage?: boolean }) {
  const options = {
    inlineStyles: {
      ITALIC: {
        style: { fontSize: 14 },
      },
    },
  };
  return post.match('({"blocks":)') ? (
    <Typography
      color='textPrimary'
      component='p'
      gutterBottom
      variant={postPage ? 'h6' : 'subtitle1'}
      dangerouslySetInnerHTML={{
        __html: stateToHTML(convertFromRaw(JSON.parse(post).body), options),
      }}
    />
  ) : (
    <Typography
      color='textPrimary'
      component='p'
      gutterBottom
      variant={postPage ? 'h6' : 'subtitle1'}
    >
      {post}
    </Typography>
  );
}
