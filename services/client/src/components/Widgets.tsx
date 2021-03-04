import React from 'react';
import { User } from '../types';

export default function Widgets({ user }: { user?: User }) {
  return <h3>{user?.profile.name} widgets.</h3>;
}
