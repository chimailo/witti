import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { KEYS } from '../constants';
import { setAuthToken } from '../../lib/axiosConfig';
import { APIError, User, InfinitePostResponse, Post } from '../../types';

type Args = {
  pages: InfinitePostResponse[];
  pageParams: unknown;
};

export function usePost(post_id: number) {
  localStorage.token && setAuthToken(localStorage.token);

  return useQuery<Post, APIError>(`/posts/${post_id}`, async () => {
    const res: AxiosResponse<Post> = await axios.get(`/posts/${post_id}`);
    return res.data;
  });
}

export function useInfinitePosts(key: string | any[], url: string) {
  localStorage.token && setAuthToken(localStorage.token);

  return useInfiniteQuery<InfinitePostResponse, APIError>(
    key,
    async ({ pageParam = 0 }) => {
      const res: AxiosResponse<InfinitePostResponse> = await axios.get(
        `${url}&cursor=${pageParam}`
      );
      return res.data;
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
    }
  );
}

export function useCreatePost() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async ({ body }: { body: string; author?: User; key: string }) => {
      const res: AxiosResponse<Post> = await axios.post(`/posts`, { body });
      return res.data;
    },
    {
      onMutate: ({ body, author, key }) => {
        // @ts-expect-error
        queryClient.setQueryData<Args>(key, (oldData) => ({
          pageParams: oldData?.pageParams,
          pages: oldData?.pages.map((page, i) => {
            if (i === 0)
              return {
                nextCursor: page.nextCursor,
                data: [
                  {
                    id: new Date().getTime(),
                    body,
                    comments: 0,
                    likes: 0,
                    isLiked: false,
                    parent: null,
                    created_on: new Date(Date.now()).toLocaleDateString(
                      'en-gb',
                      {
                        month: 'short',
                        day: 'numeric',
                      }
                    ),
                    author: {
                      id: author?.id,
                      name: author?.profile.name,
                      avatar: author?.profile.avatar,
                      username: author?.auth.username,
                    },
                  },
                  ...page.data,
                ],
              };
            return page;
          }),
        }));
      },
      onError: (error: AxiosError<APIError>) => {
        console.log('Error: ', error.message);
        // to error reporting service
      },
      onSettled: () => queryClient.invalidateQueries(KEYS.FEED),
    }
  );
}

export function useCreateComment() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      body,
      post_id,
    }: {
      key: string;
      body: string;
      post_id: number;
    }) => {
      const res: AxiosResponse<Post> = await axios.post(
        `/posts/${post_id}/comments`,
        {
          body,
        }
      );
      return res.data;
    },
    {
      onError: (error: AxiosError<APIError>) => {
        console.error('Error: ', error.response?.data);
        // to error reporting service
      },
      onSettled: () => queryClient.invalidateQueries(),
    }
  );
}

export function useDeletePost() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async (post_id: number) => {
      const res: AxiosResponse<Post> = await axios.delete(`/posts/${post_id}`);
      return res.data;
    },
    {
      onError: (error: AxiosError<APIError>) => {
        console.log('Error: ', error.response?.data.message);
        // to error reporting service
      },
      onSuccess: () => queryClient.invalidateQueries(),
    }
  );
}

export function useUpdatePostLike() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      post_id,
    }: {
      post_id: number;
      pageIndex: number;
      key: string;
    }) => {
      const res: AxiosResponse<Post> = await axios.post(
        `/posts/${post_id}/likes`
      );
      return res.data;
    },
    {
      onMutate: ({ pageIndex, post_id, key }) => {
        // @ts-expect-error
        queryClient.setQueryData<Args>(key, (oldData) => {
          const page = oldData?.pages[pageIndex];

          if (page) {
            const newPage = page?.data.map((post) => {
              if (post.id === post_id) {
                if (post.isLiked) {
                  post.likes = post.likes - 1;
                  post.isLiked = false;
                } else {
                  post.likes = post.likes + 1;
                  post.isLiked = true;
                }
              }
              return post;
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
        console.log('Error: ', error.message);
        // to error reporting service
      },
      onSettled: () => queryClient.invalidateQueries(),
    }
  );
}
