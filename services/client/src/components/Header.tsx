import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import FormControl from '@material-ui/core/FormControl';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import MenuItem from '@material-ui/core/MenuItem';
import SearchIcon from '@material-ui/icons/Search';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {
  makeStyles,
  Theme,
  createStyles,
  fade,
} from '@material-ui/core/styles';
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
    search: {
      display: 'flex',
      alignItems: 'center',
      flexGrow: 1,
      borderRadius: 32,
      margin: theme.spacing(0, 2),
      padding: theme.spacing(0, 2),
      backgroundColor: theme.palette.secondary.light,
      '&:active': {
        backgroundColor: 'unset',
        border: `1px solid ${theme.palette.primary.light}`,
        // boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
        // borderColor: theme.palette.primary.main,
      },
    },
    searchIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      marginRight: theme.spacing(1),
    },
    inputRoot: {
      width: '100%',
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
      <Box display='flex'>
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
            onClick={() => history.push(`/${user?.auth.username}/profiles`)}
          >
            <Avatar
              alt={user ? user.profile.avatar : auth?.profile.avatar}
              src={user ? user.profile.avatar : auth?.profile.avatar}
              className={classes.avatar}
            />
          </IconButton>
        )}
        <Box ml={1}>
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
      </Box>
      <span>
        {title?.toLowerCase() === 'explore' && (
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon fontSize='small' />
            </div>
            <InputBase
              placeholder='Search…'
              classes={{
                root: classes.inputRoot,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
        )}
        {title &&
          (title.toLowerCase() === 'home' ||
            title.toLowerCase() === 'explore') && (
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
      </span>
    </Toolbar>
  );
}
