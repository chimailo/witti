export type APIError = {
  error: string;
  message: string;
};

interface Suggestions {
  id: number;
  name: string;
  username: string;
  avatar: string;
  link: string;
}

export type AuthParams = {
  name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
};

export type Profile = {
  name: string;
  avatar: string;
  bio?: string;
  dob: Date | null;
  username: string;
  updated_on: Date;
  created_on: Date;
  isFollowing?: boolean;
};

export type User = {
  id: number;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  followers: number;
  following: number;
  isFollowing: boolean;
  profile: Profile;
  activity: {
    last_sign_in_ip: string;
  current_sign_in_ip: string;
  last_sign_in_on: Date;
  current_sign_in_on: Date;
  sign_in_count: number;}
};

export type Post = {
  id: number;
  body: string;
  created_on: string;
  updated_on?: string;
  isLiked: boolean;
  likes: number;
  comments: number;
  tags: Tag[];
  author: {
    id: number;
    name: string;
    avatar: string;
    username: string;
    isFollowing: boolean;
  };
  parent: {
    id: number;
    body: string;
    author: Pick<User, 'id', 'profile'>
  }
};

export type Tag = {
  id: number;
  name: string;
  isFollowing: boolean;
  followedBy: { users: User[]; count: number };
};

export type Message = {
  id: number;
  body: string;
  isRead: boolean;
  created_on: string;
  author_id?: number;
  user?: {
    id: number;
    profile: Profile
  };
};

export type Notification = {
  id: number;
  subject: string;
  item_id: number;
  timestamp: string;
  user: Partial<User>;
  post?: Pick<Post, 'id' | 'body'>;
};

export type InfinitePostResponse = {
  data: Post[];
  nextCursor: number;
  total?: number;
};

export type InfiniteUserResponse = {
  data: User[];
  nextCursor: number;
  total?: number;
};

export interface InfiniteMessageResponse {
  data: Message[];
  nextCursor: number;
}

export interface InfiniteNotificationResponse {
  data: Notification[];
  nextCursor: number;
}

export interface InfiniteTagResponse {
  data: Tag[];
  nextCursor: number;
}

export interface InfinitePostPages {
  pages: InfinitePostResponse[];
  pageParams: unknown;
}

export interface InfiniteTagPages {
  pages: InfiniteTagResponse[];
  pageParams: unknown;
}

export interface Search {
  results: {
    tags: Tags[];
    users: Users[];
  };
}
