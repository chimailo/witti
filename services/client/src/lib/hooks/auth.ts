import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { setAuthToken } from '../../lib/axiosConfig';
import { KEYS } from '../constants';
import {
  APIError,
  Post,
  User,
  LoginParams,
  SignupParams,
  InfiniteUserResponse,
  InfinitePostResponse,
} from '../../types';

export function useSignup() {
  return useMutation(
    async (values: SignupParams) => {
      const { name, username, email, password } = values;

      const { data }: AxiosResponse<{ token: string }> = await axios.post(
        '/auth/register',
        JSON.stringify({ name, username, email, password })
      );
      return data;
    },
    {
      onSuccess: ({ token }) => localStorage.setItem('token', token),
      onError: (error: AxiosError<APIError>) =>
        console.log(error.response?.data),
    }
  );
}

export function useLogin() {
  return useMutation(
    async (values: LoginParams) => {
      const { data }: AxiosResponse<{ token: string }> = await axios.post(
        '/auth/login',
        JSON.stringify(values)
      );
      return data;
    },
    {
      onSuccess: ({ token }) => localStorage.setItem('token', token),
      onError: (error: AxiosError<APIError>) =>
        console.log(error.response?.data),
    }
  );
}

export function useAuth() {
  const token = localStorage.getItem('token');
  if (token) setAuthToken(token);

  return useQuery<User, APIError>(
    KEYS.AUTH,
    async () => {
      const { data }: AxiosResponse<User> = await axios.get('/auth/user');
      return data;
    },
    {
      enabled: !!token,
    }
  );
}

export function useUser(username: string) {
  const token = localStorage.getItem('token');
  if (token) setAuthToken(token);

  return useQuery<User, APIError>([KEYS.USER, username], async () => {
    const { data }: AxiosResponse<User> = await axios.get(
      `/profile/${username}`
    );
    return data;
  });
}

export function useInfiniteUsers(url: string) {
  localStorage.token && setAuthToken(localStorage.token);

  return useInfiniteQuery<InfiniteUserResponse, APIError>(
    url,
    async ({ pageParam = 0 }) => {
      const res: AxiosResponse<InfiniteUserResponse> = await axios.get(
        `${url}?cursor=${pageParam}`
      );
      return res.data;
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
    }
  );
}

type Args = {
  pages: InfiniteUserResponse[];
  pageParams: unknown;
};

export function useFollowUser() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      user_id,
      follow,
    }: {
      user_id: number;
      post_id?: number;
      key: string | any[];
      pageIndex?: number;
      follow?: boolean;
    }) => {
      const res: AxiosResponse<User> = await axios.post(
        `/users/${user_id}/${follow ? 'unfollow' : 'follow'}`
      );
      return res.data;
    },
    {
      onMutate: ({ user_id, post_id, pageIndex, key, follow }) => {
        if (pageIndex !== undefined && typeof pageIndex === 'number') {
          if (post_id) {
            return queryClient.setQueryData<{
              pages: InfinitePostResponse[];
              pageParams: unknown;
              // @ts-expect-error
            }>(key, (oldData) => {
              const page = oldData?.pages[pageIndex];

              if (page) {
                const newPage = page?.data.map((post) =>
                  post.id === post_id
                    ? {
                        ...post,
                        author: {
                          ...post.author,
                          isFollowing: follow ? false : true,
                        },
                      }
                    : post
                );

                oldData?.pages.splice(pageIndex, 1, {
                  data: newPage,
                  nextCursor: page?.nextCursor,
                });
              }
              return oldData;
            });
          } else {
            // @ts-expect-error
            return queryClient.setQueryData<Args>(key, (oldData) => {
              const page = oldData?.pages[pageIndex];

              if (page) {
                const newPage = page?.data.map((user) =>
                  user.id === user_id
                    ? {
                        ...user,
                        isFollowing: follow ? false : true,
                      }
                    : user
                );

                oldData?.pages.splice(pageIndex, 1, {
                  data: newPage,
                  nextCursor: page?.nextCursor,
                });
              }
              return oldData;
            });
          }
        }
        if (post_id) {
          return queryClient.setQueryData<Post>(
            key,
            // @ts-expect-error
            (post) => {
              return {
                ...post,
                author: {
                  ...post?.author,
                  isFollowing: follow ? false : true,
                },
              };
            }
          );
        } else {
          return queryClient.setQueryData<User>(
            key,
            // @ts-expect-error
            (user) => ({
              ...user,
              isFollowing: follow ? false : true,
            })
          );
        }
      },
      onError: (error: AxiosError<APIError>) => {
        console.log('Error: ', error.message);
        // to error reporting service
      },
      onSettled: (_data, _error, { key }) => queryClient.invalidateQueries(key),
    }
  );
}
