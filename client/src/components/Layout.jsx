import React from 'react';
import NavBar from './modules/NavBar.jsx';
import Terminal from './modules/terminal.jsx';
const Layout = ({ children, currentPage }) => {
    return (
        <div>
            <NavBar currentPage={currentPage} />
            <main>{children}</main>
            <Terminal username = "shaunakj"/>
        </div>
    );
};

export default Layout;