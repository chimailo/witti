import React, { useEffect, useState } from 'react';
import {
  NavLink,
  useHistory,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { useQueryClient } from 'react-query';
import PluginEditor from '@draft-js-plugins/editor';

import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import SearchIcon from '@material-ui/icons/Search';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { SvgIcon } from '@material-ui/core';
import {
  createStyles,
  Theme,
  makeStyles,
  useTheme,
} from '@material-ui/core/styles';
import { Omit } from '@material-ui/types';

import CreatePostModal from './modals/CreatePost';
import SidebarMenu from './dropdown/Sidebar';
import { KEYS, ROUTES } from '../lib/constants';
import { useNotificationCount } from '../lib/hooks/notifs';
import { User } from '../types';
import { Logo, PenIcon } from './svg';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menu: {
      top: 0,
      left: 0,
      width: 240,
      position: 'fixed',
      textAlign: 'center',
      height: '100%',
      overflowX: 'hidden',
      padding: theme.spacing(0, 2),
      backgroundColor: theme.palette.background.paper,
      [theme.breakpoints.between('sm', 'md')]: {
        width: 100,
      },
    },
    list: {
      width: '100%',
    },
    listItem: {
      margin: theme.spacing(2, 0),
      transition: theme.transitions.create('color'),
      color: theme.palette.grey[800],
      '&:hover': {
        color: theme.palette.primary.main,
      },
      [theme.breakpoints.up('sm')]: {
        margin: theme.spacing(3, 0),
      },
    },
    listItemIcon: {
      color: 'inherit',
      [theme.breakpoints.down('md')]: {
        justifyContent: 'center',
      },
    },
  })
);

type ListItemLinkProps = {
  primary: string;
  to: string;
  icon: React.ReactElement;
};

const ListItemLink = (props: ListItemLinkProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));

  const { to, primary, icon } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef<any, Omit<RouterLinkProps, 'to'>>((itemProps, ref) => (
        <NavLink
          to={to}
          ref={ref}
          activeStyle={{ color: theme.palette.primary.main }}
          {...itemProps}
        />
      )),
    [to, theme.palette.primary.main]
  );

  return (
    <ListItem
      className={classes.listItem}
      component={renderLink}
      disableGutters
      {...props}
    >
      <ListItemIcon className={classes.listItemIcon}>{icon}</ListItemIcon>
      <Hidden only={['sm', 'md']}>
        <ListItemText
          primary={primary}
          primaryTypographyProps={{ variant: matchesXs ? 'subtitle1' : 'h6' }}
        />
      </Hidden>
    </ListItem>
  );
};

export default function Sidebar({
  user,
  cacheKey,
}: {
  user?: User;
  cacheKey?: string | any[];
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const editorRef = React.useRef<PluginEditor>(null);

  const history = useHistory();
  const queryClient = useQueryClient();
  const { data: notifs } = useNotificationCount();

  const classes = useStyles();
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));

  const openMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleModalOpen = () => {
    handleMenuClose();
    setModalOpen(true);
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <section className={classes.menu}>
      <ListItem disableGutters>
        <ListItemText>
          <Logo />
        </ListItemText>
      </ListItem>
      <List component='nav' aria-label='user menu' className={classes.list}>
        <ListItemLink
          primary='Home'
          to={ROUTES.HOME}
          icon={<HomeOutlinedIcon fontSize={matchesXs ? 'default' : 'large'} />}
        />
        <ListItemLink
          primary='Explore'
          to={ROUTES.EXPLORE}
          icon={<SearchIcon fontSize={matchesXs ? 'default' : 'large'} />}
        />
        <ListItemLink
          primary='Notifications'
          to={ROUTES.NOTIFICATIONS}
          icon={
            <Badge overlap='circle' badgeContent={notifs?.count} color='error'>
              <NotificationsNoneIcon
                fontSize={matchesXs ? 'default' : 'large'}
              />
            </Badge>
          }
        />
        <ListItemLink
          primary='Messages'
          to={ROUTES.MESSAGES}
          icon={
            <EmailOutlinedIcon fontSize={matchesXs ? 'default' : 'large'} />
          }
        />
        <ListItem
          aria-controls='add post'
          aria-haspopup='true'
          onClick={handleModalOpen}
          className={classes.listItem}
          disableGutters
          button
        >
          <ListItemIcon className={classes.listItemIcon}>
            <SvgIcon
              component={PenIcon}
              viewBox='0 0 128 128'
              style={{ fontSize: '2.5rem' }}
            />
          </ListItemIcon>
          <Hidden only={['sm', 'md']}>
            <ListItemText
              primary='Add Post'
              primaryTypographyProps={{
                variant: matchesXs ? 'subtitle1' : 'h6',
              }}
            />
          </Hidden>
        </ListItem>
        <Divider />
        <Hidden xsDown>
          <ListItem
            aria-controls='profile-menu'
            aria-haspopup='true'
            onClick={openMenu}
            style={{ margin: theme.spacing(3, 0) }}
            disableGutters
            button
          >
            <ListItemIcon className={classes.listItemIcon}>
              <Avatar alt={user?.profile.name} src={user?.profile.avatar} />
            </ListItemIcon>
            <Hidden mdDown>
              <ListItemText
                primary={`${user?.profile.name}`}
                secondary={'@' + user?.profile.username}
                primaryTypographyProps={{
                  variant: 'subtitle2',
                  noWrap: true,
                }}
              />
            </Hidden>
          </ListItem>
        </Hidden>
        <Hidden smUp>
          <ListItemLink
            primary='Profile'
            to={`/${user?.profile.username}/profile`}
            icon={<PersonOutlineIcon />}
          />
          <ListItemLink
            primary='Settings'
            to={ROUTES.SETTINGS}
            icon={<SettingsOutlinedIcon />}
          />
          <Divider />
          <ListItem
            onClick={() => {
              localStorage.removeItem('token');
              queryClient.removeQueries(KEYS.AUTH);
              history.push(ROUTES.LOGIN);
            }}
            className={classes.listItem}
            button
          >
            <ListItemText primary='Logout' />
          </ListItem>
        </Hidden>
      </List>
      <SidebarMenu
        user={user}
        anchorEl={anchorEl}
        handleClose={handleMenuClose}
      />
      {/* error boundary */}
      <CreatePostModal
        editorRef={editorRef}
        isOpen={isModalOpen}
        cacheKey={cacheKey}
        handleClose={() => setModalOpen(false)}
      />
    </section>
  );
}
