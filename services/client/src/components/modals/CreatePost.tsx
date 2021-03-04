import React from 'react';
import PluginEditor from 'draft-js-plugins-editor';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';
import ClearIcon from '@material-ui/icons/Clear';
import Editor from '../Editor';

type CreatePostModalProps = {
  editorRef: React.Ref<PluginEditor>;
  isOpen: boolean;
  cacheKey: string;
  post_id?: number;
  handleClose: () => void;
};

function CreatePostModal(props: CreatePostModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));

  const { isOpen, handleClose, editorRef, post_id, cacheKey } = props;

  return (
    <Dialog
      fullScreen={fullScreen}
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
        <Editor
          cacheKey={cacheKey}
          editorRef={editorRef}
          post_id={post_id}
          closeEditor={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export default React.forwardRef<PluginEditor, CreatePostModalProps>(
  (props, ref) => {
    return <CreatePostModal editorRef={ref} {...props} />;
  }
);
