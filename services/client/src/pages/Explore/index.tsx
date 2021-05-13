import React, { useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import Page from '../../components/Page';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../../components/Loading';
import { KEYS } from '../../lib/constants';
import { useFollowTag, useTagsToFollow } from '../../lib/hooks/user';
import { Tag } from '../../types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      padding: theme.spacing(2),
    },
    root: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.secondary.main}`,
      '&:hover': {
        backgroundColor: theme.palette.secondary.light,
      },
    },
    button: {
      marginLeft: theme.spacing(1),
      textTransform: 'lowercase',
    },
  })
);

export default function Explore() {
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const classes = useStyles();
  const followTag = useFollowTag();
  const {
    data,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTagsToFollow();

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  const aboutTag = (tag: Tag) => {
    const users = tag.followedBy.users;
    const count = tag.followedBy.count;
    if (users.length === 1) return `Followed by ${users[0].profile.name}`;
    if (users.length === 2 && count === 0)
      return `Followed by ${users[0].profile.name} and ${users[1].profile.name}`;

    return `Followed by ${users[0].profile.name}, ${users[1].profile.name} and ${count} others you follow.`;
  };

  return (
    <Page title='Explore' description='Search for tags and users.'>
      <Header back search />
      <Paper elevation={0} style={{ marginTop: 4 }}>
        <Typography className={classes.title}>
          <strong>Popular Tags</strong>
        </Typography>
        <Divider />
        {isLoading ? (
          <CenteredLoading />
        ) : isError ? (
          <Box py={4}>
            <Typography color='textSecondary' align='center'>
              {error?.response?.data.message}
            </Typography>
          </Box>
        ) : (
          <>
            {data?.pages.map((page, i) => (
              <React.Fragment key={i}>
                {page.data.map((tag) => (
                  <React.Fragment key={tag.id}>
                    <div className={classes.root}>
                      <Link
                        underline='none'
                        to={`/tags/${tag.name}`}
                        component={RouterLink}
                      >
                        <Typography
                          noWrap
                          color='textPrimary'
                          variant='subtitle1'
                        >
                          <strong>#{tag.name}</strong>
                        </Typography>
                        <Typography color='textPrimary' variant='body2'>
                          {aboutTag(tag)}
                        </Typography>
                      </Link>
                      <Button
                        variant='outlined'
                        color='primary'
                        size='small'
                        className={classes.button}
                        onClick={() =>
                          followTag.mutate({
                            tag_id: tag.id,
                            pageIndex: i,
                            key: KEYS.TAG_TO_FOLLOW,
                          })
                        }
                      >
                        {tag.isFollowing ? 'unfollow' : 'follow'}
                      </Button>
                    </div>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
            <LoadMore
              fullWidth
              resource='tags'
              iconSize={16}
              ref={loadMoreRef}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={() => fetchNextPage()}
              style={{ textTransform: 'capitalize' }}
            />
          </>
        )}
      </Paper>
    </Page>
  );
}
