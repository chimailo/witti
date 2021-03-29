import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import { ROUTES } from '../../lib/constants';
import { setAxiosDefaultParams } from '../../lib/axiosConfig';

import Login from '../../pages/Login';
import Signup from '../../pages/Signup';
import Landing from '../../pages/Landing';
import Home from '../../pages/Home';
import Explore from '../../pages/Explore';
import Notifications from '../../pages/Notifications';
import Messages from '../../pages/Messages';
import Post from '../../pages/Post';
import Posts from '../../pages/profile/Posts';
import Comments from '../../pages/profile/Comments';
import Favorites from '../../pages/profile/Favorites';
import Followers from '../../pages/profile/Followers';
import Following from '../../pages/profile/Following';
import Chat from '../../pages/Chat';

setAxiosDefaultParams();

export default function App() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <Router>
        <Switch>
          <Route exact path={ROUTES.LANDING}>
            <Landing />
          </Route>
          <Route exact path={ROUTES.SIGNUP}>
            <Signup />
          </Route>
          <Route exact path={ROUTES.LOGIN}>
            <Login />
          </Route>
          <PrivateRoute exact path={ROUTES.MESSAGES}>
            <Messages />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.CHAT}>
            <Chat />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.HOME}>
            <Home />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.POST}>
            <Post />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.REPLIES}>
            <Comments />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.LIKES}>
            <Favorites />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.PROFILE}>
            <Posts />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.FOLLOWERS}>
            <Followers />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.FOLLOWING}>
            <Following />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.NOTIFICATIONS}>
            <Notifications />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.EXPLORE}>
            <Explore />
          </PrivateRoute>
          {/*  <Route exact path={ROUTES.TERMS}>
              <Terms />
            </Route> */}
        </Switch>
      </Router>
    </div>
  );
}
