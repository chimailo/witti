import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios, { AxiosError, AxiosResponse } from 'axios';
import debounce from 'lodash.debounce';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useMediaQuery,
} from '@material-ui/core';
import { APIError, Search } from '../types';
import { CenteredLoading } from './Loading';
import { setAuthToken } from '../lib/axiosConfig';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    search: {
      display: 'flex',
      alignItems: 'center',
      borderRadius: 32,
      margin: theme.spacing(0, 2),
      padding: theme.spacing(0, 2),
      backgroundColor: theme.palette.secondary.light,
      '&:focus': {
        backgroundColor: 'unset',
        border: `1px solid ${theme.palette.primary.light}`,
        // boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
        // borderColor: theme.palette.primary.main,
      },
    },
    searchIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      marginRight: theme.spacing(1),
    },
    inputRoot: {
      width: '100%',
    },
    suggestions: {
      position: 'absolute',
      maxHeight: 400,
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 1,
      overflow: 'scroll',
      scrollbarWidth: 'none' /* Firefox */,
      boxShadow: theme.shadows[2],
      margin: theme.spacing(0, 2),
      backgroundColor: theme.palette.background.paper,
      '-ms-overflow-style': 'none' /* IE and Edge */,
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        margin: 'unset',
      },
    },
  })
);

export default function SearchComponent() {
  const [value, setValue] = useState('');
  const [data, setData] = useState<Search>();
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<AxiosError<APIError>>();
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();
  const xsDown = useMediaQuery('(max-width:500px)');

  const fetchSearchResults = async (term: string) => {
    setIsLoading(true);
    localStorage.token && setAuthToken(localStorage.token);

    try {
      const res: AxiosResponse<Search> = await axios.get(`/search?q=${term}`);

      setData(res.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsError(true);
      setError(error);
    }

    setIsLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((newValue: string) => fetchSearchResults(newValue), 1000),
    []
  );

  const updateValue = (newValue: string) => {
    setValue(newValue);
    debouncedSave(newValue);
  };

  return (
    <Box position={xsDown ? 'unset' : 'relative'} flexGrow={1}>
      <form onSubmit={(e) => e.preventDefault()} className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon fontSize='small' />
        </div>
        <InputBase
          placeholder='Search…'
          inputProps={{ 'aria-label': 'search' }}
          value={value}
          onChange={(e) => updateValue(e.target.value)}
          classes={{ root: classes.inputRoot }}
        />
      </form>
      {value && (
        <div className={classes.suggestions}>
          <Suggestions
            data={data}
            error={error}
            isError={isError}
            isLoading={isLoading}
          />
        </div>
      )}
    </Box>
  );
}

interface SuggestionProps {
  data?: Search;
  error?: AxiosError<APIError>;
  isLoading: boolean;
  isError: boolean;
}

function Suggestions({ data, error, isError, isLoading }: SuggestionProps) {
  const history = useHistory();

  return (
    <List disablePadding>
      {isLoading ? (
        <CenteredLoading />
      ) : isError ? (
        <ListItem>
          <ListItemText primary={error?.response?.data.message} />
        </ListItem>
      ) : (
        <>
          {data?.results.tags.map((tag) => (
            <ListItem
              key={tag.id}
              button
              divider
              alignItems='flex-start'
              onClick={() => history.push(`/tags/${tag.name}`)}
            >
              <ListItemText primary={`#${tag.name}`}></ListItemText>
            </ListItem>
          ))}
          {data?.results.users.map((user) => (
            <ListItem
              key={user.id}
              button
              divider
              alignItems='flex-start'
              onClick={() => history.push(`/${user.profile.username}`)}
            >
              <ListItemAvatar>
                <Avatar alt={user.profile.name} src={user.profile.avatar} />
              </ListItemAvatar>
              <ListItemText
                primary={user.profile.name}
                secondary={user.profile.username}
              />
            </ListItem>
          ))}
        </>
      )}
    </List>
  );
}
