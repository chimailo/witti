import React, { Fragment, useState } from 'react';
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
import { EditorState } from 'draft-js';


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

export default function RichEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // console.log(editorRef);

  return (
    <>
      <Box px={2} pt={2}>
        <div className={editorStyles.editor}>
          <Editor
            // ref={editorRef}
            editorState={editorState}
            onChange={setEditorState}
            plugins={plugins}
          />
        </div>
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
      </Box>
      <EmojiSuggestions />
    </>
  );
}

// export default React.forwardRef<PluginEditor, IProps>((props, ref) => (
//   <RichEditor editorRef={ref} {...props} />
// ));
