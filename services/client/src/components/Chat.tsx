import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { Box, TextField } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import SendIcon from '@material-ui/icons/Send';

import DeleteMessage from '../components/dropdown/message';
import { Message, User } from '../types';
import { KEYS } from '../lib/constants';
import { useDeleteMessage } from '../lib/hooks/messages';
import { useSendMessage } from '../lib/hooks/messages';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    msgBox: {
      '&:hover span': {
        visibility: 'visible',
      },
    },
    authMsg: {
      position: 'relative',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomLeftRadius: 18,
      padding: theme.spacing(1, 2),
      color: theme.palette.common.white,
      backgroundColor: theme.palette.primary.dark,
    },
    msgBody: {
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderBottomRightRadius: 18,
      padding: theme.spacing(1, 2),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    more: {
      visibility: 'hidden',
      margin: theme.spacing(0, 1),
    },
  })
);

export function Chat({
  message,
  pageIndex,
  username,
}: {
  message: Message;
  username?: string;
  pageIndex: number;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const classes = useStyles();
  const queryClient = useQueryClient();
  const auth = queryClient.getQueryData<User>(KEYS.AUTH);
  const deleteMessage = useDeleteMessage();

  return (
    <>
      <Box my={1}>
        {message.author_id === auth?.id ? (
          <Box
            display='flex'
            alignItems='center'
            justifyContent='flex-end'
            className={classes.msgBox}
          >
            <Box maxWidth='90%'>
              <Box display='flex' alignItems='center'>
                <span className={classes.more}>
                  <IconButton
                    size='small'
                    aria-label='delete message'
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                  >
                    <MoreHorizIcon color='disabled' />
                  </IconButton>
                </span>
                <Typography variant='body2' className={classes.authMsg}>
                  {message.body}
                </Typography>
              </Box>
              <Typography variant='body2' align='right' color='textSecondary'>
                <small>
                  {new Date(message.created_on).toLocaleDateString('en-gb', {
                    hour12: true,
                    hour: 'numeric',
                    minute: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </small>
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box display='flex' alignItems='center' className={classes.msgBox}>
            <Box maxWidth='90%'>
              <Box display='flex' alignItems='center'>
                <Typography variant='body2' className={classes.msgBody}>
                  {message.body}
                </Typography>
                <span className={classes.more}>
                  <IconButton
                    size='small'
                    aria-label='delete message'
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                  >
                    <MoreHorizIcon color='disabled' />
                  </IconButton>
                </span>
              </Box>
              <Typography variant='body2' color='textSecondary'>
                <small>
                  {new Date(message.created_on).toLocaleDateString('en-gb', {
                    hour12: true,
                    hour: 'numeric',
                    minute: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </small>
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <DeleteMessage
        authorId={message.author_id}
        anchorEl={anchorEl}
        closeMenu={() => setAnchorEl(null)}
        deleteMessage={() =>
          deleteMessage.mutate({ msg_id: message.id, username, pageIndex })
        }
        deleteMessageForUser={() =>
          deleteMessage.mutate({
            msg_id: message.id,
            username,
            pageIndex,
            userOnly: true,
          })
        }
      />
    </>
  );
}

export function ChatForm({
  user,
  authorId,
}: {
  user: { id: number; username: string };
  authorId?: number;
}) {
  const [message, setMessage] = useState<string>('');
  const classes = useStyles();
  const sendMessage = useSendMessage();

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!message) return;

    sendMessage.mutate({ message, to: user, from: authorId });
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <TextField
        name='message'
        placeholder='Enter your message here...'
        type='text'
        color='secondary'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
      />
      <IconButton type='submit' aria-label='send message' color='primary'>
        <SendIcon />
      </IconButton>
    </form>
  );
}
