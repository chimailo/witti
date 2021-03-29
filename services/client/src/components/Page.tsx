import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Sidebar from './Sidebar';
import Widgets from './Widgets';
import { useAuth } from '../lib/hooks/auth';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    main: {
      [theme.breakpoints.up('sm')]: {
        marginLeft: 104,
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: 244,
      },
    },
  })
);

export default function Page({
  children,
  key,
}: {
  key?: string;
  children: React.ReactNode;
}) {
  const classes = useStyles();
  const { data: auth } = useAuth();

  return (
    <Container maxWidth='xl' disableGutters>
      <Hidden xsDown>
        <Sidebar user={auth} key={key} />
      </Hidden>
      <div className={classes.main}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={8}>
            {children}
          </Grid>
          <Hidden smDown>
            <Grid item xs={12} md={4}>
              <Widgets user={auth} />
            </Grid>
          </Hidden>
        </Grid>
      </div>
    </Container>
  );
}
