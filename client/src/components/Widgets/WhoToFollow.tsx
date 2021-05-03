import { Link as RouterLink } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { Link, Typography, Button, Divider, Box } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { CenteredLoading } from '../Loading';
import { KEYS } from '../../lib/constants';
import { useFollowUser, useToFollow } from '../../lib/hooks/user';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      top: 0,
      position: 'sticky',
      marginTop: theme.spacing(0.5),
    },
    title: {
      padding: theme.spacing(2),
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      flexGrow: 1,
    },
    avatar: {
      [theme.breakpoints.down('xs')]: {
        width: 32,
        height: 32,
      },
    },
  })
);

export default function WhoToFollow() {
  const classes = useStyles();
  const followUser = useFollowUser();
  const { data: users, isLoading, isError } = useToFollow();

  return (
    <Paper elevation={0} className={classes.paper}>
      <Typography variant='subtitle1' className={classes.title}>
        <strong>Who to follow</strong>
      </Typography>
      <Divider />
      <List>
        {isLoading ? (
          <CenteredLoading />
        ) : isError ? (
          <ListItem>
            <ListItemText primary='An unexpected error occured, please try again' />
          </ListItem>
        ) : (
          <>
            {users?.slice(0, 3).map((user) => (
              <Box
                key={user.id}
                display='flex'
                alignItems='center'
                px={1}
                py={2}
              >
                <Link
                  underline='none'
                  to={`/${user.profile.username}`}
                  component={RouterLink}
                  className={classes.link}
                >
                  <Avatar
                    aria-label='avatar'
                    src={user.profile.avatar}
                    alt={user.profile.name}
                    className={classes.avatar}
                  />
                  <Box ml={1}>
                    <Typography noWrap color='textPrimary' variant='body2'>
                      {user.profile.name}
                    </Typography>
                    <Typography color='textSecondary' variant='body2'>
                      <small>{`@${user.profile.username}`}</small>
                    </Typography>
                  </Box>
                </Link>
                <Button
                  variant='outlined'
                  color='primary'
                  size='small'
                  aria-label={user.isFollowing ? 'unfollow' : 'follow'}
                  style={{ textTransform: 'lowercase' }}
                  onClick={() =>
                    followUser.mutate({
                      user_id: user.id,
                      key: KEYS.TO_FOLLOW,
                      widget: true,
                    })
                  }
                >
                  {user.isFollowing ? 'following' : 'follow'}
                </Button>
              </Box>
            ))}
          </>
        )}
      </List>
    </Paper>
  );
}
