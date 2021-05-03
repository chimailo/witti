import React, { useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import LoadMore from '../../components/Loading';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../Loading';
import { KEYS } from '../../lib/constants';
import { useFollowTag, useTagsToFollow } from '../../lib/hooks/user';
import { Tag } from '../../types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      maxHeight: 400,
      overflow: 'scroll',
      scrollbarWidth: 'none' /* Firefox */,
      '-ms-overflow-style': 'none' /* IE and Edge */,
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },
    title: {
      padding: theme.spacing(2),
    },
    root: {
      display: 'flex',
      alignItems: 'top',
      justifyContent: 'space-between',
      padding: theme.spacing(1, 2),
      '&:hover span': {
        visibility: 'visible',
      },
    },
    more: {
      visibility: 'hidden',
      marginLeft: theme.spacing(1),
    },
    button: {
      textTransform: 'lowercase',
    },
  })
);

export default function TopTags() {
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const classes = useStyles();
  const followTag = useFollowTag();
  const {
    data,
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
    <>
      <Paper elevation={0} className={classes.paper}>
        <Typography className={classes.title}>
          <strong>Top Tags to follow</strong>
        </Typography>
        <Divider />
        {isLoading ? (
          <CenteredLoading />
        ) : isError ? (
          <Typography align='center' gutterBottom>
            An error occured, please try again.
          </Typography>
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
                        <Typography noWrap variant='subtitle1'>
                          #{tag.name}
                        </Typography>
                        <Typography color='textSecondary' variant='body2'>
                          <small>{aboutTag(tag)}</small>
                        </Typography>
                      </Link>
                      <span className={classes.more}>
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
                      </span>
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
    </>
  );
}
