import React from 'react';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Notification } from '../types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItemAvatar: {
      [theme.breakpoints.down('xs')]: {
        minWidth: 40,
      },
    },
    avatar: {
      [theme.breakpoints.down('xs')]: {
        width: 32,
        height: 32,
      },
    },
    gutters: {
      [theme.breakpoints.between('md', 'lg')]: {
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
      },
      [theme.breakpoints.down('xs')]: {
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
      },
    },
  })
);

export default function NotifCard({ notif }: { notif: Notification }) {
  const classes = useStyles();
  const history = useHistory();

  let notificatn: { link: string; text: string };
  switch (notif.subject) {
    case 'message':
      notificatn = {
        text: 'sent you a message.',
        link: `/messages/${notif.user.profile?.username}`,
      };
      break;
    case 'follow':
      notificatn = {
        text: 'started following you.',
        link: `/${notif.user.profile?.username}`,
      };
      break;
    case 'comment':
      notificatn = {
        text: 'commented on your post.',
        link: `/posts/${notif.item_id}`,
      };
      break;
    case 'like':
      notificatn = {
        text: 'liked your post',
        link: `/posts/${notif.item_id}`,
      };
      break;
    default:
      notificatn = {
        text: 'recently added a post.',
        link: `/posts/${notif.item_id}`,
      };
      break;
  }

  return (
    <ListItem
      button
      classes={{ gutters: classes.gutters }}
      onClick={() => history.push(notificatn.link)}
    >
      <ListItemAvatar className={classes.listItemAvatar}>
        <Avatar
          alt='Profile Picture'
          src={notif.user.profile?.avatar}
          className={classes.avatar}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <>
            <Typography variant='body2' component='p'>
              <strong>{notif.user.profile?.name}</strong> &nbsp;
              {notificatn.text}
            </Typography>
            <Typography color='textSecondary' gutterBottom noWrap>
              <small>
                {new Date(notif.timestamp).toLocaleDateString('en-gb', {
                  hour12: true,
                  hour: 'numeric',
                  weekday: 'short',
                  minute: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </small>
            </Typography>
          </>
        }
        secondary={
          <>
            {notif.post && (
              <Typography variant='body2'>{notif.post.body}</Typography>
            )}
          </>
        }
      />
    </ListItem>
  );
}
