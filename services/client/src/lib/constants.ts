export const REFETCH_INTERVAL = 1000;

// query keys
const AUTH = 'auth';
const USER = 'user';
const FEED = 'feed';
const CHAT_KEY = 'chat';
const NOTIFS = 'notifs';
const NOTIFS_COUNT = 'notifs_count';
const MESSAGES_KEY = 'messages';
const CREATE_POST = 'create-post';

export const KEYS = {
  CHAT_KEY,
  AUTH,
  USER,
  FEED,
  NOTIFS,
  CREATE_POST,
  NOTIFS_COUNT,
  MESSAGES_KEY,
};

// routes
const LANDING = '/';
const LOGIN = '/login';
const SIGNUP = '/signup';
const TERMS = '/terms';

const HOME = '/home';
const EXPLORE = '/explore';
const NOTIFICATIONS = '/notifications';
const MESSAGES = '/messages';
const CHAT = '/chats/:username';

const PROFILE = '/:username/profile';
const REPLIES = '/:username/replies';
const LIKES = '/:username/likes';

const FOLLOWERS = '/:username/followers';
const FOLLOWING = '/:username/following';

const POST = '/posts/:postId';
const EDIT_PROFILE = '/:username/edit';
const SETTINGS = '/:username/settings';

export const ROUTES = {
  LANDING,
  LOGIN,
  SIGNUP,
  TERMS,
  HOME,
  EXPLORE,
  NOTIFICATIONS,
  CHAT,
  MESSAGES,
  PROFILE,
  REPLIES,
  LIKES,
  FOLLOWERS,
  FOLLOWING,
  POST,
  EDIT_PROFILE,
  SETTINGS,
};
