import React from 'react';
import { useParams } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Header from '../../components/Header';
import Page from '../../components/Page';
import { KEYS } from '../../lib/constants';
import { useTag } from '../../lib/hooks/posts';
import TabChild, { a11yProps, TabPanel } from '../../components/tabs';

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

export default function Tag() {
  const [value, setValue] = React.useState(0);
  const classes = useStyles();
  const { name } = useParams<{ name: string }>();
  const { data: tag, isLoading: loading, isError: tagError } = useTag(name);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const meta = loading || tagError ? '' : `${tag?.followedBy.count} following`;
  const key = value === 1 ? [KEYS.TAGS, 'top'] : [KEYS.TAGS, 'latest'];

  return (
    <Page cacheKey={key} title='Tags' description='Select tags to follow'>
      <Header back title={`#${name}`} meta={meta} />
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
          <TabChild cacheKey={key} url={`/tags/${name}?latest=true`} />
        </TabPanel>
        <TabPanel value={value} index={1} type='top'>
          <TabChild cacheKey={key} url={`/tags/${name}?top=true`} />
        </TabPanel>
      </Box>
    </Page>
  );
}
