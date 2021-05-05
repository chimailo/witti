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
  Profile,
  User,
  InfiniteUserResponse,
  InfinitePostResponse,
  InfiniteTagResponse,
  InfiniteTagPages,
  Tag,
  AuthParams,
} from '../../types';

export function useSignup() {
  return useMutation(
    async (values: AuthParams) => {
      const { email, password, name, username } = values;

      const { data }: AxiosResponse<{ token: string }> = await axios.post(
        '/users/register',
        JSON.stringify({ email, password, name, username })
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
    async (values: Pick<AuthParams, 'email' | 'password'>) => {
      const { data }: AxiosResponse<{ token: string }> = await axios.post(
        '/users/login',
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
      const { data }: AxiosResponse<User> = await axios.get('/users/auth');
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

  return useQuery<User, AxiosError<APIError>>(
    [KEYS.USER, username],
    async () => {
      const { data }: AxiosResponse<User> = await axios.get(
        `/profile/${username}`
      );
      return data;
    }
  );
}

export function useSetProfile() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  if (token) setAuthToken(token);

  return useMutation(
    async ({
      values
    }: {
      values: Omit<Profile, 'created_on' | 'updated_on'>; cacheKey: string
    }) => {
    console.log(values.dob)
    const res: AxiosResponse<Profile> = await axios.put(
      '/profile',
      // @ts-expect-error
      {...values, dob: new Date(values.dob)}
    )
    return res.data
  },
  {
    onMutate: ({cacheKey, values}) => 
      // @ts-expect-error
      queryClient.setQueryData<Profile>(cacheKey, oldData => ({
        ...oldData,
        name: values.name,
        username: values.username,
        bio: values.bio,
        dob: values.dob,
        avatar: values.avatar,
      })),
    onError: (error: AxiosError<APIError>) => {
      console.log(error)
    }
  }
  )
}

export function useToFollow() {
  const token = localStorage.getItem('token');
  if (token) setAuthToken(token);

  return useQuery<
    Pick<User, 'id' | 'profile' | 'isFollowing'>[],
    AxiosError<APIError>
  >(KEYS.TO_FOLLOW, async () => {
    const {
      data,
    }: AxiosResponse<
      Pick<User, 'id' | 'profile' | 'isFollowing'>[]
    > = await axios.get(`/users/to-follow`);
    return data;
  });
}

export function useInfiniteUsers(url: string) {
  localStorage.token && setAuthToken(localStorage.token);

  return useInfiniteQuery<InfiniteUserResponse, AxiosError<APIError>>(
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
      widget?: boolean;
    }) => {
      const res: AxiosResponse<User> = await axios.post(
        `/users/${user_id}/${follow ? 'unfollow' : 'follow'}`
      );
      return res.data;
    },
    {
      onMutate: ({ user_id, post_id, pageIndex, key, follow, widget }) => {
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
          if (widget) {
            // @ts-expect-error
            return queryClient.setQueryData<User[]>(key, (oldData) =>
              oldData?.map((user) =>
                user.id === user_id
                  ? { ...user, isFollowing: follow ? false : true }
                  : user
              )
            );
          }
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

export function useTagsToFollow() {
  localStorage.token && setAuthToken(localStorage.token);

  return useInfiniteQuery<InfiniteTagResponse, AxiosError<APIError>>(
    KEYS.TAG_TO_FOLLOW,
    async ({ pageParam = 0 }) => {
      const res: AxiosResponse<InfiniteTagResponse> = await axios.get(
        `/tags/to-follow?cursor=${pageParam}`
      );
      return res.data;
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
    }
  );
}

export function useFollowTag() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      tag_id,
    }: {
      tag_id: number;
      pageIndex: number;
      key: string | any[];
    }) => {
      const res: AxiosResponse<Tag[]> = await axios.post(
        `/tags/${tag_id}/follow`
      );
      return res.data;
    },
    {
      onMutate: ({ tag_id, pageIndex, key }) => {
        // @ts-expect-error
        queryClient.setQueryData<InfiniteTagPages>(key, (oldData) => {
          const page = oldData?.pages[pageIndex];

          if (page) {
            const newPage = page?.data.map((tag) => {
              if (tag.id === tag_id) {
                if (tag.isFollowing) {
                  tag.isFollowing = false;
                } else {
                  tag.isFollowing = true;
                }
              }
              return tag;
            });

            oldData?.pages.splice(pageIndex, 1, {
              data: newPage,
              nextCursor: page?.nextCursor,
            });
          }
          return oldData;
        });
      },
      onError: (error: AxiosError<APIError>) => {
        console.error('Error: ', error.response?.data);
        // to error reporting service
      },
      onSettled: () => queryClient.invalidateQueries(),
    }
  );
}
