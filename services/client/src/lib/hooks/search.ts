import axios, { AxiosError, AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { APIError, Search } from '../../types';
import { setAuthToken } from '../axiosConfig';

export function useSearch(term: string) {
  localStorage.token && setAuthToken(localStorage.token);

  return useQuery<Search, AxiosError<APIError>>(['search', term], async () => {
    const res: AxiosResponse<Search> = await axios.get(`/search?q=${term}`);
    return res.data;
  });
}
