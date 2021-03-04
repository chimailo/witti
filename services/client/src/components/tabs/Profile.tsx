import React from 'react';
import { NavLink, LinkProps } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Omit } from '@material-ui/types';
import {
  makeStyles,
  createStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      width: '100%',
      display: 'flex',
      backgroundColor: theme.palette.background.paper,
    },
    button: {
      width: '100%',
      textTransform: 'capitalize',
      minHeight: '54px',
      fontWeight: theme.typography.fontWeightBold,
      padding: theme.spacing(2),
      transition: theme.transitions.create('all'),
      color: theme.palette.text.secondary,
      '&:hover': {
        color: theme.palette.primary.main,
      },
    },
  })
);

export default function ProfileTab({ username }: { username?: string }) {
  return (
    <AppBar position='static' color='default' elevation={0}>
      <Toolbar>
        <TabLink label='posts' to={`/${username}/profile`} />
        <TabLink label='replies' to={`/${username}/replies`} />
        <TabLink label='favorites' to={`/${username}/likes`} />
      </Toolbar>
    </AppBar>
  );
}

function TabLink({ to, label }: { to: string; label: string }) {
  const theme = useTheme();
  const classes = useStyles();

  const Link = React.forwardRef<any, Omit<LinkProps, 'to'>>((props, ref) => (
    <NavLink
      ref={ref}
      to={to}
      activeStyle={{
        backgroundColor: 'rgba(20, 184, 156, 0.05)',
        color: theme.palette.primary.main,
      }}
      {...props}
    />
  ));

  return (
    <ButtonBase focusRipple className={classes.button} component={Link}>
      {label}
    </ButtonBase>
  );
}
