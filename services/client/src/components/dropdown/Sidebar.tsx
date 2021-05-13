import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import MuiLink from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import EditIcon from '@material-ui/icons/Edit';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import EditProfileModal from '../modals/EditProfile';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { KEYS, ROUTES } from '../../lib/constants';
import { User } from '../../types';

type MenuProps = {
  user?: User;
  anchorEl: null | HTMLElement;
  handleClose: () => void;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuPaper: {
      minWidth: '240px',
    },
    menuDivider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    menuItem: {
      minHeight: '32px',
    },
    avatar: {
      marginRight: theme.spacing(1),
    },
    profile: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: theme.spacing(0, 2),
    },
    link: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignContent: 'center',
    },
    listItemIcon: {
      color: 'inherit',
      minWidth: 0,
      alignItems: 'center',
      marginRight: theme.spacing(2),
    },
  })
);

export default function SidebarMenu({
  user,
  anchorEl,
  handleClose,
}: MenuProps) {
  const [isOpen, setModalOpen] = useState(false)
  const classes = useStyles();
  const history = useHistory();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.removeQueries(KEYS.AUTH);
    localStorage.removeItem('token');
    handleClose();
    history.push(ROUTES.LOGIN);
  };

  return (
    <>
    <div>
      <Menu
        id='user-menu'
        classes={{ paper: classes.menuPaper }}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <div className={classes.profile}>
          <Avatar
            alt={`${user?.profile.name}`}
            src={user?.profile.avatar}
            className={classes.avatar}
          />
          <div>
            <Typography variant='subtitle1'>
              {`${user?.profile.name}`}
            </Typography>
            <Typography variant='subtitle2'>
              {'@' + user?.profile.username}
            </Typography>
          </div>
        </div>
        <Divider className={classes.menuDivider} />
        <MenuItem onClick={handleClose} classes={{ root: classes.menuItem }}>
          <MuiLink
            color='inherit'
            underline='none'
            component={RouterLink}
            className={classes.link}
            to={`/${user?.profile.username}`}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <PersonOutlineIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='Profile' />
          </MuiLink>
        </MenuItem>
        <MenuItem
          classes={{ root: classes.menuItem }}
          onClick={() => {
            handleClose()
            setModalOpen(true)
          }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText primary='Edit Profile' />
        </MenuItem>
        <MenuItem onClick={handleClose} classes={{ root: classes.menuItem }}>
          <MuiLink
            color='inherit'
            underline='none'
            component={RouterLink}
            className={classes.link}
            to={`/${user?.profile.username}/settings`}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <SettingsOutlinedIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary='Settings' />
          </MuiLink>
        </MenuItem>
        <Divider className={classes.menuDivider} />
        <MenuItem onClick={handleLogout} classes={{ root: classes.menuItem }}>
          Logout
        </MenuItem>
      </Menu>
    </div>
    <EditProfileModal isOpen={isOpen} user={user!} handleClose={() => setModalOpen(false)} />
    </>
  );
}
