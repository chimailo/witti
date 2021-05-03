import React from 'react';
import { useLocation } from 'react-router-dom';
import TopTags from './TopTags';
import WhoToFollow from './WhoToFollow';

export default function Widgets() {
  const { pathname } = useLocation<{ pathname: string }>();

  return (
    <>
      {!pathname.split('/').includes('explore') && <TopTags />}
      <WhoToFollow />
    </>
  );
}
