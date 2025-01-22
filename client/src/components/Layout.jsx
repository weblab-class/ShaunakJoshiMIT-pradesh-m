// Layout.jsx
import React from 'react';
import NavBar from './modules/NavBar.jsx';
import Terminal from './modules/Terminal.jsx';

const Layout = ({ children, currentPage }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar currentPage={currentPage} />
      <main
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',          // Enable scrolling within the main area
          paddingBottom: '220px',    // Space reserved for the Terminal
        }}
      >
        {children}
      </main>
      <Terminal />
    </div>
  );
};

export default Layout;
