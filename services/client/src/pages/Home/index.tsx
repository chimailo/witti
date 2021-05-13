import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles, Theme, createStyles } from '@material-ui/core';

import Header from '../../components/Header';
import Page from '../../components/Page';
import TabChild, { a11yProps, TabPanel } from '../../components/tabs';
import { KEYS } from '../../lib/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar: {
      boxShadow: theme.shadows[0],
      backgroundColor: theme.palette.background.paper,
    },
    tab: {
      textTransform: 'capitalize',
    },
  })
);

export default function Home() {
  const [value, setValue] = React.useState(0);
  const classes = useStyles();
  const key =
    value === 1 ? [KEYS.HOME_FEED, 'top'] : [KEYS.HOME_FEED, 'latest'];

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Page cacheKey={key} title='Home'>
      <Header avatar title='home' />
      <Box flexGrow={1} mt={0.5}>
        <AppBar position='static' className={classes.appbar}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label='Tag Tab'
            textColor='primary'
            indicatorColor='primary'
            variant='fullWidth'
          >
            <Tab
              label='Latest'
              {...a11yProps('latest')}
              className={classes.tab}
            />
            <Tab label='Top' {...a11yProps('top')} className={classes.tab} />
          </Tabs>
        </AppBar>
        <TabPanel type='latest' value={value} index={0}>
          <TabChild cacheKey={key} url={`/posts?latest=true`} />
        </TabPanel>
        <TabPanel value={value} index={1} type='top'>
          <TabChild cacheKey={key} url={`/posts?top=true`} />
        </TabPanel>
      </Box>
    </Page>
  );
}
