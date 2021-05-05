import { Fragment, useState } from 'react';
import { convertToRaw, EditorState } from 'draft-js';
import Box from '@material-ui/core/Box';
import Editor from '@draft-js-plugins/editor';
import { ItalicButton, BoldButton } from '@draft-js-plugins/buttons';
import '@draft-js-plugins/inline-toolbar/lib/plugin.css';
import CharCounter from './plugins/charCounter';
import editorStyles from './styles/Editor.module.css';
import {undoPlugin, linkPlugin, linkifyPlugin, inlineToolbarPlugin, emojiPlugin} from './setup'
import { useSetProfile } from '../../lib/hooks/user';
import { Profile } from '../../types';

const { EmojiSuggestions, EmojiSelect } = emojiPlugin;
const { InlineToolbar } = inlineToolbarPlugin;
const { UndoButton, RedoButton } = undoPlugin;

const plugins = [
  emojiPlugin,
  inlineToolbarPlugin,
  linkPlugin,
  linkifyPlugin,
  undoPlugin,
];

export default function RichEditor({user, cacheKey}: {user: Omit<Profile, 'created_on' | 'updated_on'>, cacheKey: string}) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const {mutate} = useSetProfile();

  const charLength = editorState.getCurrentContent().getPlainText().length;
  const hasText = editorState.getCurrentContent().hasText();

  const saveProfile = () => {
    if (!hasText || charLength > 250) return;

    const contentState = editorState.getCurrentContent();
    const bio = JSON.stringify({ bio: convertToRaw(contentState) });
    const values = {...user, bio}
    
    mutate({values, cacheKey});
  }

  setInterval(() =>  saveProfile(), 5000)

  return (
    <>
      <Box py={2}>
        <div className={editorStyles.editor}>
          <Editor
          placeholder=''
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
          <CharCounter limit={250} editorState={editorState} />
        </Box>
      </Box>
      <EmojiSuggestions />
    </>
  );
}
