import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { ROUTES, KEYS } from '../lib/constants';
import { User } from '../types';

const PrivateRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<User>(KEYS.AUTH);

  return (
    <Route
      {...rest}
      render={(props) => {
        return !!user ? (
          children
        ) : (
          <Redirect
            to={{ pathname: ROUTES.LOGIN, state: { from: props.location } }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
