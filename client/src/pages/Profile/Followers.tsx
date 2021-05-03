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
  } = useInfiniteUsers(`/users/${username}/followers`);

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  return (
    <Page>
      <Header
        back
        title={`${user?.profile.name}`}
        user={user}
        meta={`${user?.followers} followers`}
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
              {page.data.map((followers, idx) => (
                <Fragment key={idx}>
                  <ProfileCard
                    user={followers}
                    page={i}
                    cacheKey={`/users/${username}/followers`}
                  />
                </Fragment>
              ))}
            </Fragment>
          ))}
          <LoadMore
            fullWidth
            resource='followers'
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
