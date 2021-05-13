import React from 'react';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import { PostHeader, PostContent, PostMeta } from '../../components/Post';
import { Post } from '../../types';

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

interface IProps {
  cacheKey: string | any[];
  page: number;
  post: Post;
}

export default function PostCard({ post, cacheKey, page }: IProps) {
  const classes = useStyles();

  return (
    <Paper elevation={0} component='article' className={classes.paper}>
      <PostHeader post={post} page={page} />
      <PostContent post={post} />
      <PostMeta post={post} page={page} cacheKey={cacheKey} />
    </Paper>
  );
}
