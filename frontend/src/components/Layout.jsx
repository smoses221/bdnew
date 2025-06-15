import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from './NavigationBar';

const Layout = () => {
  return (
    <>
      <NavigationBar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
