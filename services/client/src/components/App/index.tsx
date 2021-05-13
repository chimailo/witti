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
import Profile from '../../pages/Profile';
import Followers from '../../pages/Profile/Followers';
import Following from '../../pages/Profile/Following';
import Chat from '../../pages/Chat';
import Tag from '../../pages/Tag';

setAxiosDefaultParams();

export default function App() {
  return (
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
        <PrivateRoute exact path={ROUTES.HOME}>
            <Home />
          </PrivateRoute>
        <PrivateRoute exact path={ROUTES.EXPLORE}>
          <Explore />
        </PrivateRoute>
        <PrivateRoute exact path={ROUTES.POST}>
          <Post />
        </PrivateRoute>
        <PrivateRoute exact path={ROUTES.TAG}>
          <Tag />
        </PrivateRoute>
        <PrivateRoute exact path={ROUTES.MESSAGES}>
          <Messages />
        </PrivateRoute>
        <PrivateRoute exact path={ROUTES.CHAT}>
          <Chat />
        </PrivateRoute>
        <PrivateRoute exact path={ROUTES.NOTIFICATIONS}>
          <Notifications />
        </PrivateRoute>  
        <PrivateRoute exact path={ROUTES.PROFILE}>
          <Profile />
        </PrivateRoute>
        <PrivateRoute exact path={ROUTES.FOLLOWERS}>
          <Followers />
        </PrivateRoute>
        <PrivateRoute exact path={ROUTES.FOLLOWING}>
          <Following />
        </PrivateRoute>
        {/*  <Route exact path={ROUTES.TERMS}>
              <Terms />
            </Route> */}
      </Switch>
    </Router>
  );
}
