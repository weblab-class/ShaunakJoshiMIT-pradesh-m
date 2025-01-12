import React from 'react';

const NavBar = ({ currentPage }) => {
  const pages = ['home', 'settings', 'profile'];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f4f4f4',
      borderBottom: '1px solid #ccc',
    }}>
      <div style={{ fontWeight: 'bold' }}>Logo goes here</div>

      <div style={{ fontStyle: 'italic', color: '#555' }}>
        Hint: Type "help" in terminal for instructions on navigating our website
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        {pages.map((page) => (
          <span
            key={page}
            style={{
              fontWeight: currentPage === page ? 'bold' : 'normal',
              textDecoration: currentPage === page ? 'underline' : 'none',
              cursor: 'pointer',
            }}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
