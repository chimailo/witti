import axios, { AxiosError, AxiosResponse } from 'axios';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import { InfiniteMessageResponse, APIError, Message } from '../../types';
import { KEYS, REFETCH_INTERVAL } from '../constants';
import { setAuthToken } from '../axiosConfig';

type Args = {
  pages: InfiniteMessageResponse[];
  pageParams: unknown;
};

export function useInfiniteMessages() {
  localStorage.token && setAuthToken(localStorage.token);

  return useInfiniteQuery<InfiniteMessageResponse, AxiosError<APIError>>(
    KEYS.MESSAGES_KEY,
    async ({ pageParam = 0 }) => {
      const res: AxiosResponse<InfiniteMessageResponse> = await axios.get(
        `/chats?cursor=${pageParam}`
      );
      return res.data;
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
    }
  );
}

export function useInfiniteChatMessages(username: string) {
  localStorage.token && setAuthToken(localStorage.token);

  return useInfiniteQuery<InfiniteMessageResponse, AxiosError<APIError>>(
    [KEYS.CHAT_KEY, username],
    async ({ pageParam = 0 }) => {
      const res: AxiosResponse<InfiniteMessageResponse> = await axios.get(
        `/messages?username=${username}&cursor=${pageParam}`
      );
      return res.data;
    },
    {
      refetchInterval: REFETCH_INTERVAL,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
    }
  );
}

export function useSendMessage() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      message,
      to,
    }: {
      message: string;
      to: { id: number; username: string };
      from?: number;
    }) => {
      const res: AxiosResponse<Message> = await axios.post(
        `/messages?user=${to.id}`,
        { body: message }
      );
      return res.data;
    },
    {
      onMutate: ({ message, from, to }) => {
        queryClient.setQueryData<Args>(
          [KEYS.CHAT_KEY, to.username],
          // @ts-expect-error
          (oldData) => ({
            pageParams: oldData?.pageParams,
            pages: oldData?.pages.map((page, i) => {
              if (i === 0)
                return {
                  nextCursor: page.nextCursor,
                  data: [
                    {
                      id: new Date().getTime(),
                      body: message,
                      author_id: from,
                      isRead: false,
                      created_on: new Date(Date.now()).toLocaleDateString(
                        'en-us',
                        {
                          hour12: true,
                          hour: 'numeric',
                          minute: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      ),
                    },
                    ...page.data,
                  ],
                };
              return page;
            }),
          })
        );
      },
      onError: (error: AxiosError<APIError>) => {
        console.log('Error: ', error.message);
        // to error reporting service
      },
      onSettled: (_d, _e, { to }) =>
        queryClient.invalidateQueries([KEYS.CHAT_KEY, to.username]),
    }
  );
}

export function useDeleteMessage() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      msg_id,
      userOnly,
    }: {
      pageIndex: number;
      msg_id: number;
      username?: string;
      userOnly?: boolean;
    }) => {
      const res: AxiosResponse<{ message: string }> = await axios.delete(
        `/messages/${msg_id}${userOnly ? '?userOnly=true' : ''}`
      );
      return res.data;
    },
    {
      onMutate: ({ msg_id, pageIndex, username }) => {
        // @ts-expect-error
        queryClient.setQueryData<Args>([KEYS.CHAT_KEY, username], (oldData) => {
          const page = oldData?.pages[pageIndex];

          if (page) {
            const newPage = page.data.filter(
              (message) => message.id !== msg_id
            );
            console.log(newPage);

            oldData?.pages.splice(pageIndex, 1, {
              data: newPage,
              nextCursor: page?.nextCursor,
            });
          }
          console.log(oldData);
          return oldData;
        });
      },
      onError: (error: AxiosError<APIError>) => {
        console.log('Error: ', error.response?.data.message);
        // to error reporting service
      },
      onSettled: (_d, _e, { username }) => {
        queryClient.invalidateQueries([KEYS.CHAT_KEY, username]);
        queryClient.invalidateQueries(KEYS.MESSAGES_KEY);
      },
    }
  );
}
