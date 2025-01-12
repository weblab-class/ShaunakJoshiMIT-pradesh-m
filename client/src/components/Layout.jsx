// src/components/Layout.jsx
import React from 'react';
import NavBar from './modules/NavBar.jsx';

const Layout = ({ children }) => {
    return (
        <div>
            <NavBar />
            <main>
                {children}
            </main>
        </div>
    );
};


export default Layout;
