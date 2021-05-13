import React, { Fragment, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import FollowTab from '../../components/tabs/Follow';
import Header from '../../components/Header';
import LoadMore from '../../components/Loading';
import Page from '../../components/Page';
import ProfileCard from '../../components/cards/ProfileCard';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../../components/Loading';
import { useInfiniteUsers, useUser } from '../../lib/hooks/user';

export default function FollowersTab() {
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const { username } = useParams<{ username: string }>();
  const { data: user } = useUser(username);
  const {
    data,
    error,
    isError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers(`/users/${username}/following`);

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  return (
    <Page title='Followers' description={user?.profile.name}>
      <Header
        back
        title={`${user?.profile.name}`}
        user={user}
        meta={`${user?.following} following`}
      />
      <FollowTab username={username} />
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
            <Fragment key={i}>
              {page.data.map((following, idx) => (
                <Fragment key={idx}>
                  <ProfileCard
                    user={following}
                    page={i}
                    cacheKey={`/users/${username}/following`}
                  />
                </Fragment>
              ))}
            </Fragment>
          ))}
          <LoadMore
            fullWidth
            resource='users followed'
            iconSize={16}
            ref={loadMoreRef}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={() => fetchNextPage()}
            style={{ textTransform: 'capitalize' }}
          />
        </>
      )}
    </Page>
  );
}
