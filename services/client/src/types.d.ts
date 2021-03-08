export type APIError = {
  error: string;
  message: string;
};

export type LoginParams = {
  identity: string;
  password: string;
};

export type SignupParams = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type Auth = {
  email: string;
  username: string;
  fullname: string;
  avatar: string;
  is_admin: boolean;
  is_active: boolean;
};

export type Profile = {
  name: string;
  avatar: string;
  bio?: string;
  dob?: Date;
  updated_on: Date;
  created_on: Date;
  isFollowing?: boolean;
};

export type User = {
  id: number;
  last_sign_in_ip: string;
  current_sign_in_ip: string;
  last_sign_in_on: Date;
  current_sign_in_on: Date;
  sign_in_count: number;
  followers: number;
  following: number;
  isFollowing: boolean;
  auth: Auth;
  profile: Profile;
};

export type Post = {
  id: number;
  body: string;
  created_on: string;
  updated_on?: string;
  isLiked: boolean;
  likes: number;
  comments: number;
  parent: Post | null;
  author: {
    id: number;
    name: string;
    avatar: string;
    username: string;
    isFollowing: boolean;
  };
};

export type Message = {
  id: number;
  body: string;
  isRead: boolean;
  created_on: string;
  author_id?: number;
  user?: {
    id: number;
    name: string;
    avatar: string;
    username: string;
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
