import React, { Fragment, useRef } from 'react';
import { Box, Typography } from '@material-ui/core';
import LoadMore from '../Loading';
import PostCard from '../cards/PostCard';
import useIntersectionObserver from '../../lib/hooks/useIntersectionObserver';
import { CenteredLoading } from '../Loading';
import { useInfinitePosts } from '../../lib/hooks/posts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  type: string;
}

export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, type, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`${type}-tab`}
      aria-labelledby={`${type}-tab`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

export const a11yProps = (type: string) => ({
  id: `${type}-tab`,
  'aria-controls': `${type}-tabpanel`,
});

interface TabProps {
  url: string;
  cacheKey: string | any[];
}

export default function TabChild({ url, cacheKey }: TabProps) {
  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfinitePosts(cacheKey, url);

  useIntersectionObserver({
    enabled: hasNextPage,
    target: loadMoreRef,
    onIntersect: () => fetchNextPage(),
  });

  return (
    <>
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
              {page.data.map((post, idx) => (
                <Fragment key={idx}>
                  <PostCard post={post} page={i} cacheKey={cacheKey} />
                </Fragment>
              ))}
            </Fragment>
          ))}
          <LoadMore
            fullWidth
            resource='posts'
            iconSize={24}
            ref={loadMoreRef}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={() => fetchNextPage()}
            style={{ textTransform: 'capitalize' }}
          />
        </>
      )}
    </>
  );
}
