import React, { useState, useEffect } from 'react';
import PluginEditor from '@draft-js-plugins/editor';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';
import ClearIcon from '@material-ui/icons/Clear';

import {PostEditor} from '../Editor';
import TagForm from '../forms/Tag';
import { Tag } from '../../types';
import { useAllTags, useAddTag } from '../../lib/hooks/posts';
import { validateTag } from '../../lib/validators';

type CreatePostModalProps = {
  editorRef: React.Ref<PluginEditor>;
  isOpen: boolean;
  cacheKey?: string | any[];
  post_id?: number;
  handleClose: () => void;
};

function CreatePostModal(props: CreatePostModalProps) {
  const [selectedTags, setSelectedTags] = useState<Pick<Tag, 'id' | 'name'>[]>(
    []
  );
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<Pick<Tag, 'id' | 'name'>[]>([]);
  const [errors, setErrors] = useState<any[]>([]);

  const { data } = useAllTags();
  const addTag = useAddTag();

  const theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('xs'));

  const { isOpen, handleClose, editorRef, post_id, cacheKey } = props;

  useEffect(() => {
    if (data) setTags(data);
  }, [data]);

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();

    if (!tag) return;

    const schema = validateTag();

    try {
      await schema.validate(tag);
      addTag.mutate(tag);
      setSelectedTags([...selectedTags, ...tags.filter((t) => t.name === tag)]);
      setTag('');
    } catch (error) {
      setErrors(error.errors);
    }
  };

  return (
    <Dialog
      fullScreen={xsDown}
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='add post'
    >
      <DialogTitle id='add post' style={{ padding: '8px 0' }}>
        <IconButton onClick={handleClose} color='primary'>
          <ClearIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent style={{ padding: 0 }}>
        <PostEditor
          tags={tags}
          setTags={setTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          cacheKey={cacheKey}
          editorRef={editorRef}
          post_id={post_id}
          closeEditor={handleClose}
        />
        <Box display='flex' alignItems='center' flexWrap='wrap' p={2}>
          <TagForm
            errors={errors}
            value={tag}
            handleChange={(e: any) => setTag(e.target.value)}
            handleSubmit={(e: any) => handleFormSubmit(e)}
          />
        </Box>
        <Box
          display='flex'
          alignItems='center'
          flexWrap='wrap'
          mb={4}
          px={1}
          maxHeight={xsDown ? 120 : 100}
          overflow='auto'
        >
          {tags
            ?.filter((item) => {
              const regex = new RegExp(`^${tag}`, 'gi');
              return item.name.match(regex);
            })
            .map((tag) => (
              <Chip
                key={tag.id}
                size='small'
                label={`#${tag.name}`}
                style={{ margin: 4 }}
                onClick={() => {
                  setTags(tags.filter((t) => t.id !== tag.id));
                  setSelectedTags([...selectedTags, tag]);
                }}
              />
            ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default React.forwardRef<PluginEditor, CreatePostModalProps>(
  (props, ref) => {
    return <CreatePostModal editorRef={ref} {...props} />;
  }
);
