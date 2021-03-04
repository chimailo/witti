import React, { useEffect, useState } from 'react';
import {
  Link as RouterLink,
  NavLink,
  useHistory,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { useQueryClient } from 'react-query';
import PluginEditor from 'draft-js-plugins-editor';

import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import SearchIcon from '@material-ui/icons/Search';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  createStyles,
  Theme,
  makeStyles,
  useTheme,
} from '@material-ui/core/styles';
import { Omit } from '@material-ui/types';

import SidebarMenu from './dropdown/Sidebar';
import Logo from './logo';
import CreatePostModal from './modals/CreatePost';
import { KEYS, ROUTES } from '../lib/constants';
import { User } from '../types';

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

export default function Sidebar({ user }: { user?: User }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const editorRef = React.useRef<PluginEditor>(null);

  const history = useHistory();
  const queryClient = useQueryClient();

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
            <NotificationsNoneIcon fontSize={matchesXs ? 'default' : 'large'} />
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
            <AddOutlinedIcon fontSize={matchesXs ? 'default' : 'large'} />
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
                secondary={'@' + user?.auth.username}
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
            to={`/${user?.auth.username}/profile`}
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
        cacheKey={KEYS.FEED}
        handleClose={() => setModalOpen(false)}
      />
    </section>
  );
}
