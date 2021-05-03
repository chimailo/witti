import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { setAuthToken } from '../../lib/axiosConfig';
import {
  APIError,
  User,
  InfinitePostResponse,
  Post,
  Tag,
  InfinitePostPages,
} from '../../types';

export function usePost(post_id: number) {
  localStorage.token && setAuthToken(localStorage.token);

  return useQuery<Post, AxiosError<APIError>>(`/posts/${post_id}`, async () => {
    const res: AxiosResponse<Post> = await axios.get(`/posts/${post_id}`);
    return res.data;
  });
}

export function useInfinitePosts(key: string | any[], url: string) {
  localStorage.token && setAuthToken(localStorage.token);

  return useInfiniteQuery<InfinitePostResponse, AxiosError<APIError>>(
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
    async ({ post }: { post: string; author?: User; key?: string | any[] }) => {
      const res: AxiosResponse<Post> = await axios.post(`/posts`, { post });
      return res.data;
    },
    {
      onMutate: ({ post, author, key }) => {
        // @ts-expect-error
        queryClient.setQueryData<InfinitePostPages>(key, (oldData) => ({
          pageParams: oldData?.pageParams,
          pages: oldData?.pages.map((page, i) => {
            if (i === 0)
              return {
                nextCursor: page.nextCursor,
                data: [
                  {
                    id: new Date().getTime(),
                    post: JSON.parse(post).body,
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
                      username: author?.profile.username,
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
      onSettled: () => queryClient.invalidateQueries(),
    }
  );
}

export function useCreateComment() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async ({ post, post_id }: { post: string; post_id: number }) => {
      const res: AxiosResponse<Post> = await axios.post(
        `/posts/${post_id}/comments`,
        {
          post,
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
      key: string | any[];
    }) => {
      const res: AxiosResponse<Post> = await axios.post(
        `/posts/${post_id}/likes`
      );
      return res.data;
    },
    {
      onMutate: ({ pageIndex, post_id, key }) => {
        // @ts-expect-error
        queryClient.setQueryData<InfinitePostPages>(key, (oldData) => {
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

export function useTag(name: string) {
  localStorage.token && setAuthToken(localStorage.token);

  return useQuery<Tag, AxiosError<APIError>>(['tag', name], async () => {
    const res: AxiosResponse<Tag> = await axios.get(`/tags?name=${name}`);
    return res.data;
  });
}

export function useAllTags() {
  localStorage.token && setAuthToken(localStorage.token);

  return useQuery<Pick<Tag, 'id' | 'name'>[], AxiosError<APIError>>(
    `all-tags`,
    async () => {
      const res: AxiosResponse<Pick<Tag, 'id' | 'name'>[]> = await axios.get(
        `/tags/all-tags`
      );
      return res.data;
    }
  );
}

export function useAddTag() {
  localStorage.token && setAuthToken(localStorage.token);
  const queryClient = useQueryClient();

  return useMutation(
    async (tag: string) => {
      const res: AxiosResponse<Pick<Tag, 'id' | 'name'>> = await axios.post(
        `/tags`,
        {
          name: tag,
        }
      );
      return res.data;
    },
    {
      onMutate: (tag) => {
        queryClient.setQueryData<Pick<Tag, 'id' | 'name'>[]>(
          `tags`,
          // @ts-expect-error
          (oldData) =>
            oldData && [{ id: new Date().getTime(), name: tag }, ...oldData]
        );
      },
      onError: (error: AxiosError<APIError>) => {
        console.error('Error: ', error.response?.data);
        // to error reporting service
      },
      onSettled: () => queryClient.invalidateQueries(`tags`),
    }
  );
}
