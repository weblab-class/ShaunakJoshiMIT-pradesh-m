import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from 'client/src/components/modules/NavBar.jsx';

const Layout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Layout;