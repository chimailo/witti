import React, { Fragment, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { convertToRaw, EditorState } from 'draft-js';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { Link, Typography, useMediaQuery } from '@material-ui/core';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';
import { useTheme } from '@material-ui/core/styles';

// import Editor, { createEditorStateWithText } from '@draft-js-plugins/editor';
import Editor from 'draft-js-plugins-editor';
import PluginEditor from 'draft-js-plugins-editor';
import createEmojiPlugin from 'draft-js-emoji-plugin';
import { ItalicButton, BoldButton, UnderlineButton } from 'draft-js-buttons';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin';
import createLinkPlugin from 'draft-js-anchor-plugin';
// @ts-ignore
import createLinkifyPlugin from 'draft-js-linkify-plugin';
// @ts-ignore
import createUndoPlugin from 'draft-js-undo-plugin';

import 'draft-js-inline-toolbar-plugin/lib/plugin.css';
import emojiStyles from './styles/Emoji.module.css';
import editorStyles from './styles/Editor.module.css';
import linkStyles from './styles/Link.module.css';
import linkifyStyles from './styles/Linkify.module.css';
import buttonStyles from './styles/Button.module.css';

import CharCounter from './plugins/charCounter';
import { useAuth } from '../../lib/hooks/auth';
import { useCreateComment, useCreatePost } from '../../lib/hooks/posts';
import { ROUTES, KEYS } from '../../lib/constants';

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
  theme: linkifyStyles,
});

const linkPlugin = createLinkPlugin({
  placeholder: 'http://…',
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
  cacheKey: string;
  editorRef?: React.Ref<PluginEditor>;
  closeEditor?: () => void;
  post_id?: number;
}

function RichEditor({ post_id, editorRef, closeEditor, cacheKey }: IProps) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const history = useHistory<string>();

  const { data: auth } = useAuth();
  const createPost = useCreatePost();
  const createComment = useCreateComment();

  const charLength = editorState.getCurrentContent().getPlainText().length;
  const hasText = editorState.getCurrentContent().hasText();

  const submitEditor = () => {
    if (!hasText || charLength > 250) return;

    const contentState = editorState.getCurrentContent();
    const body = JSON.stringify(convertToRaw(contentState));

    if (post_id) {
      createComment.mutate({ post_id, body, key: cacheKey });
      closeEditor && closeEditor();
    } else {
      createPost.mutate({ body, key: KEYS.FEED, author: auth });
      closeEditor && closeEditor();
      history.push(ROUTES.HOME);
    }
  };

  console.log(editorRef);

  return (
    <>
      <Box p={xsDown ? 1 : 2}>
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
              to={`/${auth?.auth.username}/profile`}
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
              >{`@${auth?.auth.username}`}</Typography>
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
        <Divider />
        <InlineToolbar>
          {(externalProps: any) => (
            <Fragment>
              <BoldButton {...externalProps} />
              <ItalicButton {...externalProps} />
              <UnderlineButton {...externalProps} />
              <linkPlugin.LinkButton {...externalProps} />
            </Fragment>
          )}
        </InlineToolbar>
        <Box display='flex' alignItems='center' mx={1}>
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
      </Box>
      <EmojiSuggestions />
    </>
  );
}

export default React.forwardRef<PluginEditor, IProps>((props, ref) => (
  <RichEditor editorRef={ref} {...props} />
));
