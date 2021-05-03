import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Sidebar from './Sidebar';
import { User } from '../types';
import { KEYS } from '../lib/constants';
import Search from './Search';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      width: '100%',
      zIndex: 1,
      position: 'sticky',
      top: 0,
      display: 'flex',
      justifyContent: 'space-between',
      padding: theme.spacing(0, 1),
      backgroundColor: theme.palette.background.paper,
    },
    drawer: {
      width: 240,
    },
    avatar: {
      flexGrow: 0,
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    title: {
      textTransform: 'capitalize',
      lineHeight: '1.4',
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

type HeaderProps = {
  title?: string;
  user?: User;
  avatar?: boolean;
  back?: boolean;
  search?: boolean;
  meta?: string;
};

export default function Header(props: HeaderProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const queryClient = useQueryClient();
  const auth = queryClient.getQueryData<User>(KEYS.AUTH);

  const { user, title, search, back, avatar, meta } = props;

  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  return (
    <Toolbar classes={{ root: classes.toolbar }} disableGutters>
      <Box display='flex' flexGrow={1} position='relative'>
        {back && (
          <IconButton
            size='small'
            aria-label='go back'
            onClick={() => history.goBack()}
          >
            <KeyboardBackspaceIcon color='primary' />
          </IconButton>
        )}
        {avatar && (
          <IconButton
            size='small'
            aria-label='menu'
            onClick={() => history.push(`/${auth?.profile.username}`)}
          >
            <Avatar
              alt={user ? user.profile.avatar : auth?.profile.avatar}
              src={user ? user.profile.avatar : auth?.profile.avatar}
              className={classes.avatar}
            />
          </IconButton>
        )}
        {title && (
          <Box
            ml={1}
            display='flex'
            flexDirection='column'
            justifyContent='center'
          >
            <Typography
              variant='subtitle1'
              component='h3'
              className={classes.title}
              noWrap
            >
              {title}
            </Typography>
            {meta && (
              <Typography
                color='textSecondary'
                noWrap
                style={{ lineHeight: 1 }}
              >
                <small>{meta}</small>
              </Typography>
            )}
          </Box>
        )}
        {search && <Search />}
        <Hidden smUp>
          <IconButton
            size='small'
            aria-label='menu'
            onClick={toggleDrawer(true)}
          >
            <MoreVertIcon />
          </IconButton>
          <Hidden smUp>
            <Drawer
              anchor='left'
              open={isDrawerOpen}
              onClose={toggleDrawer(false)}
              classes={{ paper: classes.drawer }}
            >
              <Sidebar user={auth} />
            </Drawer>
          </Hidden>
        </Hidden>
      </Box>
    </Toolbar>
  );
}
