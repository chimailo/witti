import React, { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CakeOutlinedIcon from '@material-ui/icons/CakeOutlined';
import CalendarTodayOutlinedIcon from '@material-ui/icons/CalendarTodayOutlined';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { User } from '../../types';
import { KEYS } from '../../lib/constants';
import { useFollowUser } from '../../lib/hooks/user';
import EditProfileModal from '../modals/EditProfile';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      margin: '4px 0',
      padding: theme.spacing(1, 1, 2),
    },
    avatar: {
      width: 60,
      height: 60,
      border: `2px solid ${theme.palette.primary.main}`,
      [theme.breakpoints.up('sm')]: {
        width: 80,
        height: 80,
      },
    },
    flex: {
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      marginRight: theme.spacing(1),
      color: theme.palette.text.primary,
      fontWeight: theme.typography.fontWeightBold,
    },
    marginRight: {
      marginRight: theme.spacing(1),
    },
  })
);

interface IProps {
  user: User;
  page?: number;
  cacheKey: string | any[];
  meta?: boolean
}

export default function ProfileCard({ user, page, meta, cacheKey }: IProps) {
  const [isOpen, setModalOpen] = useState(false)
  const classes = useStyles();
  const { username } = useParams<{ username: string }>();
  const follow = useFollowUser();
  const queryClient = useQueryClient();
  const auth = queryClient.getQueryData<User>(KEYS.AUTH);

  return (
    <>
    <Paper elevation={0} classes={{ root: classes.paper }}>
      <Box display='flex'>
        <Avatar
          src={user.profile.avatar}
          alt={`${user.profile.username} gravatar`}
          className={classes.avatar}
        />
        <Box display='flex' flexDirection='column' flexGrow={1} ml={1}>
          <Box display='flex' alignItems='center' mb={1}>
            <Box display='flex' flexDirection='column' flexGrow={1} mr={1}>
              <Typography
                variant='subtitle2'
                component='h6'
                noWrap
                style={{ fontWeight: 600 }}
              >
                {user.profile.name}
              </Typography>
              <Typography
                color='textSecondary'
                variant='subtitle2'
                component='h6'
                noWrap
              >
                {user && `@${user.profile.username}`}
              </Typography>{' '}
            </Box>
            {auth?.id === user.id ? (
              <Button
                variant='outlined'
                color='primary'
                aria-controls='edit profile'
                aria-haspopup='true'
                size='small'
                disableElevation
                style={{ textTransform: 'capitalize' }}
                onClick={() => setModalOpen(true)}
              >
                Edit Profile
              </Button>
            ) : !user.isFollowing ? (
              <Button
                variant='outlined'
                color='primary'
                aria-controls='follow this user'
                aria-haspopup='true'
                size='small'
                disableElevation
                style={{ textTransform: 'capitalize' }}
                onClick={() =>
                  follow.mutate({
                    user_id: user.id,
                    key: cacheKey,
                    pageIndex: page,
                    follow: user.isFollowing,
                  })
                }
              >
                follow
              </Button>
            ) : (
              <Button
                variant='outlined'
                color='primary'
                size='small'
                disableElevation
                style={{ textTransform: 'capitalize' }}
                onClick={() =>
                  follow.mutate({
                    user_id: user.id,
                    key: cacheKey,
                    pageIndex: page,
                    follow: user.isFollowing,
                  })
                }
              >
                following
              </Button>
            )}
          </Box>
          <Typography variant='body2' component='p' paragraph>
            {user ? `${user.profile.bio}` : ''}
          </Typography>
          {meta && (
              <>
          <Box display='flex' alignItems='center'>
            <Typography
              variant='body2'
              component='p'
              color='textSecondary'
              gutterBottom
              className={classes.flex}
            >
              <CalendarTodayOutlinedIcon
                fontSize='small'
                className={classes.marginRight}
              />{' '}
              joined:{' '}
              {user &&
                new Date(user.profile.created_on).toLocaleDateString('en-gb', {
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'utc',
                })}
            </Typography>
            <Typography
              variant='body2'
              component='p'
              color='textSecondary'
              gutterBottom
              style={{ marginLeft: 16 }}
              className={classes.flex}
            >
              <CakeOutlinedIcon
                fontSize='small'
                className={classes.marginRight}
              />{' '}
              {user && user.profile.dob
                ? 'dob: ' +
                  new Date(user.profile.dob).toLocaleDateString('en-gb', {
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'utc',
                  })
                : ''}
            </Typography>
          </Box>
          <Box display='flex' alignItems='center'>
            <Typography variant='body2' component='p' color='textSecondary'>
              <Link
                color='inherit'
                to={`/${username}/followers`}
                component={RouterLink}
              >
                <span className={classes.button}>{`${user.followers}`}</span>
                Followers
              </Link>
              <Link
                color='inherit'
                to={`/${username}/following`}
                component={RouterLink}
                style={{ marginLeft: 24 }}
              >
                <span className={classes.button}>{`${user.following}`}</span>
                Following
              </Link>
            </Typography>
          </Box>
            </>)}</Box>
      </Box>
    </Paper>
    <EditProfileModal isOpen={isOpen} user={user} handleClose={() => setModalOpen(false)} />
    </>
  );
}
