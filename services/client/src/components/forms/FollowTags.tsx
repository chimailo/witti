import React, { useState } from 'react'
import { Box, Chip, Typography } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { CenteredLoading } from '../Loading';
import { useAllTags } from '../../lib/hooks/posts';
import { Tag } from '../../types';

export default function FollowTagsForm() {
  const [tags, setTags] = useState<Pick<Tag, "id" | "name">[]>([])
//   const classes = useStyles();
const {data, error, status} = useAllTags()

  return (
    <>
      {status === 'loading' ? (
        <CenteredLoading />
      ) : status === 'error' ? (
        <Box py={4}>
          <Typography color='textSecondary' align='center'>
            {error?.response?.data.message}
          </Typography>
        </Box>) : (data?.map((tag) => (
              <Chip
                key={tag.id}
                color='primary'
                label={`#${tag.name}`}
                variant={tags.includes(tag) ? 'default' : 'outlined'}
                style={{ margin: 4 }}
                onClick={() => setTags([...tags, tag])}
                deleteIcon={<DoneIcon />}
                onDelete={() => tags.filter(t => t.id !== tag.id)}
              />
            )))}
    </>
  )
}
