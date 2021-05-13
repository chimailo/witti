import EmojiEmotionsOutlinedIcon from '@material-ui/icons/EmojiEmotionsOutlined';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import createEmojiPlugin from '@draft-js-plugins/emoji';
import createInlineToolbarPlugin from '@draft-js-plugins/inline-toolbar';
import createLinkifyPlugin from '@draft-js-plugins/linkify';
import createLinkPlugin from '@draft-js-plugins/anchor';
import createUndoPlugin from '@draft-js-plugins/undo';
import '@draft-js-plugins/inline-toolbar/lib/plugin.css';
import emojiStyles from './styles/Emoji.module.css';
import linkStyles from './styles/Link.module.css';
import linkifyStyles from './styles/Linkify.module.css';
import buttonStyles from './styles/Button.module.css';


const emojiPlugin = createEmojiPlugin({
  theme: emojiStyles,
  useNativeArt: true,
  selectButtonContent: <EmojiEmotionsOutlinedIcon color='primary' />,
});

const inlineToolbarPlugin = createInlineToolbarPlugin();

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

export {undoPlugin, linkPlugin, linkifyPlugin, inlineToolbarPlugin, emojiPlugin}
