import React from 'react';
import NavBar from './modules/NavBar.jsx';

const Layout = ({ children, currentPage }) => {
    return (
        <div>
            <NavBar currentPage={currentPage} />
            <main>{children}</main>
        </div>
    );
};

export default Layout;