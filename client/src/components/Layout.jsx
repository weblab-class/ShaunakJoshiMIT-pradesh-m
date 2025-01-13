import React from 'react';
import NavBar from './modules/NavBar.jsx';
import Terminal from './modules/terminal.jsx';

const Layout = ({ children, currentPage }) => {
    return (
        <div style={{ overflow: 'hidden', height: '100vh' }}>
            <NavBar currentPage={currentPage} />
            <main style={{ overflow: 'hidden' }}>{children}</main>
            <Terminal username="shaunakj" />
        </div>
    );
};

export default Layout;
