import React from 'react';
import { useLocation } from 'react-router-dom';
import Box, { BoxProps } from '@material-ui/core/Box';
import Button, { ButtonProps } from '@material-ui/core/Button';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import CircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    bottom: {
      color: theme.palette.common.white,
    },
    top: {
      color: theme.palette.primary.main,
      animationDuration: '500ms',
      position: 'absolute',
      left: 0,
    },
    circle: {
      strokeLinecap: 'round',
    },
  })
);

export function Loading(props: CircularProgressProps) {
  const classes = useStyles();

  return (
    <Box
      py={4}
      position='relative'
      display='inherit'
      justifyContent='center'
      alignItems='center'
    >
      <CircularProgress
        variant='determinate'
        className={classes.bottom}
        size={props.size || 24}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant='indeterminate'
        disableShrink
        className={classes.top}
        classes={{
          circle: classes.circle,
        }}
        size={props.size || 24}
        thickness={4}
        {...props}
      />
    </Box>
  );
}

interface CenteredLoadingProps extends BoxProps {
  size?: number;
}

export const CenteredLoading = (props: CenteredLoadingProps) => (
  <Box display='flex' alignItems='center' justifyContent='center' {...props}>
    <Loading size={props.size} />
  </Box>
);

interface LoadMoreProps extends ButtonProps {
  iconSize: number;
  resource?: string;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export default React.forwardRef<HTMLButtonElement | null, LoadMoreProps>(
  (props, ref) => {
    const { pathname } = useLocation();
    const {
      iconSize,
      resource,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    } = props;

    return (
      <>
        {isFetchingNextPage ? (
          <Button
            endIcon={<Loading size={iconSize} />}
            disabled={isFetchingNextPage}
            {...props}
          >
            Loading more...
          </Button>
        ) : hasNextPage ? (
          <Button ref={ref} onClick={() => fetchNextPage()} {...props}>
            Load more {resource}
          </Button>
        ) : pathname.includes('messages') ? (
          <Button disabled={!hasNextPage} {...props}></Button>
        ) : (
          <Button disabled={!hasNextPage} {...props}>
            No more {resource}
          </Button>
        )}
      </>
    );
  }
);
