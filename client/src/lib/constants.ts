export const REFETCH_INTERVAL = 1000;

// query keys
const AUTH = 'auth';
const USER = 'user';
const USER_PROFILE = 'profile';
const HOME_FEED = 'home/latest';
const CHAT_KEY = 'chat';
const NOTIFS = 'notifs';
const NOTIFS_COUNT = 'notifs_count';
const MESSAGES_KEY = 'messages';
const CREATE_POST = 'create-post';
const TAGS = 'tags';
const TO_FOLLOW = 'widget-toFollow';
const TAG_TO_FOLLOW = 'widget-tagToFollow';

export const KEYS = {
  CHAT_KEY,
  AUTH,
  USER,
  USER_PROFILE,
  HOME_FEED,
  NOTIFS,
  CREATE_POST,
  NOTIFS_COUNT,
  MESSAGES_KEY,
  TO_FOLLOW,
  TAG_TO_FOLLOW,
  TAGS,
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

const CHAT = '/messages/:username';
const TAG = '/tags/:name';
const POST = '/posts/:postId';

const PROFILE = '/:username';
const FOLLOWERS = '/:username/followers';
const FOLLOWING = '/:username/following';

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
  TAG,
  PROFILE,
  FOLLOWERS,
  FOLLOWING,
  POST,
  EDIT_PROFILE,
  SETTINGS,
};
