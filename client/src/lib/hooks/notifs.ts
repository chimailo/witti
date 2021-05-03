import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { KEYS, REFETCH_INTERVAL } from '../constants';
import { setAuthToken } from '../axiosConfig';
import {
  APIError,
  InfiniteNotificationResponse,
  Notification,
} from '../../types';

export function useNotificationCount() {
  localStorage.token && setAuthToken(localStorage.token);

  return useQuery<{ count: number }, AxiosError<APIError>>(
    KEYS.NOTIFS_COUNT,
    async () => {
      const res: AxiosResponse<{ count: number }> = await axios.get(
        `/notifications/count`
      );
      return res.data;
    },
    {
      refetchInterval: REFETCH_INTERVAL,
    }
  );
}

export function useInfiniteNotifications() {
  localStorage.token && setAuthToken(localStorage.token);

  return useInfiniteQuery<InfiniteNotificationResponse, AxiosError<APIError>>(
    KEYS.NOTIFS,
    async ({ pageParam = 0 }) => {
      const res: AxiosResponse<InfiniteNotificationResponse> = await axios.get(
        `/notifications?cursor=${pageParam}`
      );
      return res.data;
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
    }
  );
}

export function useRemoveNotification() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async (notif_id: number) => {
      const res: AxiosResponse<Notification> = await axios.delete(
        `/notifications/${notif_id}`
      );
      return res.data;
    },
    {
      onError: (error: AxiosError<APIError>) => {
        console.log('Error: ', error.response?.data.message);
        // to error reporting service
      },
      onSettled: () => queryClient.invalidateQueries(KEYS.NOTIFS),
    }
  );
}
