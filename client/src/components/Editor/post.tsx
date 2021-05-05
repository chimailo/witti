import React, { Fragment, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { convertToRaw, EditorState } from 'draft-js';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import { Link, Typography } from '@material-ui/core';
import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import { useTheme } from '@material-ui/core/styles';

import createEmojiPlugin from '@draft-js-plugins/emoji';
import createInlineToolbarPlugin from '@draft-js-plugins/inline-toolbar';
import createLinkifyPlugin from '@draft-js-plugins/linkify';
import createLinkPlugin from '@draft-js-plugins/anchor';
import createUndoPlugin from '@draft-js-plugins/undo';
import Editor from '@draft-js-plugins/editor';
import PluginEditor from '@draft-js-plugins/editor';
import { ItalicButton, BoldButton } from '@draft-js-plugins/buttons';

import '@draft-js-plugins/inline-toolbar/lib/plugin.css';
import emojiStyles from './styles/Emoji.module.css';
import editorStyles from './styles/Editor.module.css';
import linkStyles from './styles/Link.module.css';
import linkifyStyles from './styles/Linkify.module.css';
import buttonStyles from './styles/Button.module.css';

import CharCounter from './plugins/charCounter';
import { ROUTES } from '../../lib/constants';
import { Tag } from '../../types';
import { useAuth } from '../../lib/hooks/user';
import { useCreateComment, useCreatePost } from '../../lib/hooks/posts';

const emojiPlugin = createEmojiPlugin({
  theme: emojiStyles,
  useNativeArt: true,
  selectButtonContent: <EmojiEmotionsOutlinedIcon color='primary' />,
});
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;

const inlineToolbarPlugin = createInlineToolbarPlugin();
const { InlineToolbar } = inlineToolbarPlugin;

const linkifyPlugin = createLinkifyPlugin({
  target: '_blank',
  // @ts-ignore
  theme: linkifyStyles,
});

const linkPlugin = createLinkPlugin({
  placeholder: 'http://…',
  // @ts-ignore
  theme: linkStyles,
});

const undoPlugin = createUndoPlugin({
  undoContent: <UndoIcon color='primary' />,
  redoContent: <RedoIcon color='primary' />,
  theme: {
    undo: buttonStyles.button,
    redo: buttonStyles.button,
  },
});
const { UndoButton, RedoButton } = undoPlugin;

const plugins = [
  emojiPlugin,
  inlineToolbarPlugin,
  linkPlugin,
  linkifyPlugin,
  undoPlugin,
];

interface IProps {
  cacheKey?: string | any[];
  editorRef?: React.Ref<PluginEditor>;
  closeEditor?: () => void;
  post_id?: number;
  tags: Pick<Tag, 'id' | 'name'>[];
  selectedTags: Pick<Tag, 'id' | 'name'>[];
  setTags: React.Dispatch<React.SetStateAction<Pick<Tag, 'id' | 'name'>[]>>;
  setSelectedTags: React.Dispatch<
    React.SetStateAction<Pick<Tag, 'id' | 'name'>[]>
  >;
}

function PostEditor({
  post_id,
  editorRef,
  closeEditor,
  cacheKey,
  tags,
  setTags,
  selectedTags,
  setSelectedTags,
}: IProps) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const theme = useTheme();
  const history = useHistory<string>();

  const { data: auth } = useAuth();
  const createPost = useCreatePost();
  const createComment = useCreateComment();

  const charLength = editorState.getCurrentContent().getPlainText().length;
  const hasText = editorState.getCurrentContent().hasText();

  const submitEditor = () => {
    if (!hasText || charLength > 250) return;

    const contentState = editorState.getCurrentContent();
    const post = JSON.stringify({ body: convertToRaw(contentState) });
    
    if (post_id) {
      createComment.mutate({ post_id, post });
      closeEditor && closeEditor();
    } else {
      createPost.mutate({ post, key: cacheKey, author: auth });
      closeEditor && closeEditor();
      history.push(ROUTES.HOME);
    }
  };

  console.log(editorRef);

  return (
    <>
      <Box px={2} pt={2}>
        <Box display='flex' justifyContent='space-between'>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='flex-end'
            mb={1}
          >
            <Avatar
              aria-label='avatar'
              src={auth?.profile.avatar}
              alt={auth?.profile.name}
            />
            <Link
              underline='none'
              to={`/${auth?.profile.username}/profile`}
              component={RouterLink}
              style={{ marginLeft: 8 }}
            >
              <Typography
                color='textPrimary'
                variant='subtitle2'
                component='h6'
                noWrap
              >
                {auth?.profile.name}
              </Typography>
              <Typography
                color='textSecondary'
                variant='subtitle2'
                component='h6'
                noWrap
              >{`@${auth?.profile.username}`}</Typography>
            </Link>
          </Box>
          <Box display='flex' alignItems='center'>
            <Typography variant='subtitle2' component='h6'>
              {new Date(Date.now()).toLocaleDateString('en-gb', {
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          </Box>
        </Box>
        <div className={editorStyles.editor}>
          <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={setEditorState}
            plugins={plugins}
          />
        </div>
        {!post_id && 
        <Box display='flex' alignItems='center' flexWrap='wrap'>
          {selectedTags?.map((tag) => (
            <Chip
              key={tag.id}
              variant='outlined'
              size='small'
              label={`#${tag.name}`}
              style={{ marginRight: 8 }}
              onDelete={() => {
                setTags([tag, ...tags]);
                setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
              }}
            />
          ))}
        </Box>}
        <Divider />
      </Box>
      <InlineToolbar>
        {(externalProps: any) => (
          <Fragment>
            <BoldButton {...externalProps} />
            <ItalicButton {...externalProps} />
            <linkPlugin.LinkButton {...externalProps} />
          </Fragment>
        )}
      </InlineToolbar>
      <Box display='flex' alignItems='center' py={1}>
        <Box display='flex' flexGrow={1}>
          <EmojiSelect />
          <UndoButton />
          <RedoButton />
        </Box>
        <CharCounter limit={250} editorState={editorState} />
        <Button
          variant='contained'
          color='primary'
          disableElevation
          onClick={() => submitEditor()}
          style={{
            textTransform: 'capitalize',
            fontWeight: 'bold',
            margin: theme.spacing(0, 2),
            color: theme.palette.common.white,
          }}
          disabled={!hasText || charLength > 250}
        >
          Post
        </Button>
      </Box>
      <EmojiSuggestions />
    </>
  );
}

export default React.forwardRef<PluginEditor, IProps>((props, ref) => (
  <PostEditor editorRef={ref} {...props} />
));
