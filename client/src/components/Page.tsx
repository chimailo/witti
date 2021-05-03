import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Sidebar from './Sidebar';
import Widgets from './Widgets';
import { useAuth } from '../lib/hooks/user';

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
    gridWidget: {
      paddingLeft: theme.spacing(0.5),
    },
  })
);

export default function Page({
  children,
  cacheKey,
}: {
  cacheKey?: string | any[];
  children: React.ReactNode;
}) {
  const classes = useStyles();
  const { data: auth } = useAuth();

  return (
    <Container maxWidth='xl' disableGutters>
      <Hidden xsDown>
        <Sidebar user={auth} cacheKey={cacheKey} />
      </Hidden>
      <div className={classes.main}>
        <Grid container>
          <Grid item xs={12} md={8}>
            {children}
          </Grid>
          <Hidden smDown>
            <Grid item xs={12} md={4} className={classes.gridWidget}>
              <Widgets />
            </Grid>
          </Hidden>
        </Grid>
      </div>
    </Container>
  );
}
