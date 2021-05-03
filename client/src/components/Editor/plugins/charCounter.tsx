import React from 'react';
import { EditorState } from 'draft-js';
import { Typography } from '@material-ui/core';

interface IProps {
  editorState: EditorState;
  limit: number;
}

export default function CharCounter({ editorState, limit }: IProps) {
  const count = editorState.getCurrentContent().getPlainText().length;

  return (
    <Typography
      variant='body2'
      component='p'
      color={count > limit ? 'error' : 'textPrimary'}
    >
      {count}
    </Typography>
  );
}
