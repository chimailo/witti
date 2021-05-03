import React from 'react';
import { useParams } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Header from '../../components/Header';
import Page from '../../components/Page';
import ProfileCard from '../../components/cards/ProfileCard';
import TabChild, { a11yProps, TabPanel } from '../../components/tabs';
import { KEYS } from '../../lib/constants';
import { useUser } from '../../lib/hooks/user';

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
  const { username } = useParams<{ username: string }>();
  const { data: user } = useUser(username);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  let key: string | any[];
  switch (value) {
    case 1:
      key = [KEYS.USER_PROFILE, 'comments'];
      break;
    case 2:
      key = [KEYS.USER_PROFILE, 'likes'];
      break;
    default:
      key = [KEYS.USER_PROFILE, 'posts'];
  }

  return (
    <Page cacheKey={key}>
      <Header back title={`${user?.profile.name} `} />
      {user && (
        <ProfileCard meta user={user} cacheKey={[KEYS.USER, user.profile.username]} />
      )}
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
              label='Posts'
              {...a11yProps('posts')}
              className={classes.tab}
            />
            <Tab
              label='Replies'
              {...a11yProps('replies')}
              className={classes.tab}
            />
            <Tab
              label='Favorites'
              {...a11yProps('likes')}
              className={classes.tab}
            />
          </Tabs>
        </AppBar>
        <TabPanel type='posts' value={value} index={0}>
          <TabChild cacheKey={key} url={`/users/${username}/posts?`} />
        </TabPanel>
        <TabPanel type='replies' value={value} index={1}>
          <TabChild cacheKey={key} url={`/users/${username}/comments?`} />
        </TabPanel>
        <TabPanel value={value} index={2} type='likes'>
          <TabChild cacheKey={key} url={`/users/${username}/likes?`} />
        </TabPanel>
      </Box>
    </Page>
  );
}
