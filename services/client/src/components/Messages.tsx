import React from 'react';
import { useHistory } from 'react-router-dom';
import { InfiniteData } from 'react-query';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';
import {
  createStyles,
  Theme,
  makeStyles,
  withStyles,
} from '@material-ui/core/styles';
import { InfiniteMessageResponse } from '../types';

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: '$ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  })
)(Badge);

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

interface MessageProps {
  data: InfiniteData<InfiniteMessageResponse> | undefined;
}

export default function Messages({ data }: MessageProps) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <List disablePadding>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.data.map((message, idx) => (
            <React.Fragment key={idx}>
              <ListItem
                button
                divider
                classes={{ gutters: classes.gutters }}
                onClick={() =>
                  history.push(`/messages/${message.user?.profile.username}`)
                }
              >
                <ListItemAvatar className={classes.listItemAvatar}>
                  {!message.isRead ? (
                    <StyledBadge
                      overlap='circle'
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      variant='dot'
                    >
                      <Avatar
                        alt='Profile Picture'
                        src={message.user?.profile.avatar}
                        className={classes.avatar}
                      />
                    </StyledBadge>
                  ) : (
                    <Avatar
                      alt='Profile Picture'
                      src={message.user?.profile.avatar}
                      className={classes.avatar}
                    />
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display='flex' alignItems='center'>
                      <Box
                        display='flex'
                        alignItems='center'
                        flex={1}
                        minWidth={0}
                      >
                        <Typography style={{ whiteSpace: 'nowrap' }}>
                          {message.user?.profile.name}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='textSecondary'
                          noWrap
                          style={{ margin: '0 8px' }}
                        >
                          {`@${message.user?.profile.username}`}
                        </Typography>
                      </Box>
                      <Typography variant='body2' color='textSecondary' noWrap>
                        {new Date(message.created_on).toLocaleDateString(
                          'en-us',
                          {
                            month: 'numeric',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography noWrap variant='body2'>
                      {message.body}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </List>
  );
}
