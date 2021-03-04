import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import FormControl from '@material-ui/core/FormControl';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import Sidebar from './Sidebar';
import { User } from '../types';
import { KEYS } from '../lib/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      width: '100%',
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
  meta?: string;
  feed?: string;
  handleFeedChange?: (event: React.ChangeEvent<{ value: unknown }>) => void;
};

export default function Header(props: HeaderProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSelectOpen, setSelectOpen] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const queryClient = useQueryClient();
  const auth = queryClient.getQueryData<User>(KEYS.AUTH);

  const { user, title, back, avatar, meta, feed, handleFeedChange } = props;

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
      {back && (
        <IconButton
          size='small'
          aria-label='go back'
          onClick={() => history.goBack()}
          style={{ marginRight: 8 }}
        >
          <KeyboardBackspaceIcon color='primary' />
        </IconButton>
      )}
      {avatar && (
        <IconButton
          size='small'
          aria-label='menu'
          onClick={() => history.push(`/${user?.auth.username}/profiles`)}
        >
          <Avatar
            alt={user ? user.profile.avatar : auth?.profile.avatar}
            src={user ? user.profile.avatar : auth?.profile.avatar}
            className={classes.avatar}
          />
        </IconButton>
      )}
      <Box ml={1} flexGrow={1}>
        <Typography
          variant='subtitle1'
          component='h3'
          className={classes.title}
          noWrap
        >
          {title}
        </Typography>
        {meta && (
          <Typography color='textSecondary' noWrap style={{ lineHeight: 1 }}>
            <small>{meta}</small>
          </Typography>
        )}
      </Box>
      {title && title.toLowerCase() === 'home' && (
        <FormControl>
          <Select
            disableUnderline
            open={isSelectOpen}
            value={feed}
            onChange={handleFeedChange}
            onClose={() => setSelectOpen(false)}
            onOpen={() => setSelectOpen(true)}
          >
            <MenuItem value={'latest'}>latest</MenuItem>
            <MenuItem value={'top'}>top</MenuItem>
          </Select>
        </FormControl>
      )}
      {/* Include 'Edit User', 'follow' and 'unfollow', buttons when the user navigates to `/:username/user/*   */}
      <Hidden smUp>
        <IconButton size='small' aria-label='menu' onClick={toggleDrawer(true)}>
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
    </Toolbar>
  );
}
