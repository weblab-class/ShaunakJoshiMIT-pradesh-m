import React from 'react';
import "../styles/NavBar.css";

const NavBar = ({ currentPage }) => {
  const pages = ['home', 'settings', 'friends', 'profile'];
  
  return (
    <div className="navbar">
      <div className="navbar-logo">Logo goes here</div>
      <div className="navbar-hint">
        Hint: Type "help" in terminal for instructions on navigating our website
      </div>
      <div className="navbar-pages">
        {pages.map((page) => (
          <span
            key={page}
            className={`navbar-page ${currentPage === page ? 'active' : ''}`}
          >
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NavBar;
