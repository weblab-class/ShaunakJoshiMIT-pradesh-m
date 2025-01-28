// NavBar.jsx
import React from "react";
import "../styles/NavBar.css";

const NavBar = ({ currentPage }) => {
  // Capitalize the current page for display
  const pageName =
    currentPage.charAt(0).toUpperCase() + currentPage.slice(1).toLowerCase();

  return (
    <div className="navbar">
      <div className="navbar-logo">RETRO LOGO</div>

      {/* Display the current page in a simple, static manner */}
      <div className="navbar-current-page">
        Currently on: <span className="navbar-page-highlight">{pageName}</span>
      </div>

      {/* Animated hint bar with marquee effect */}
      <div className="navbar-hint-animated">
        <span className="marquee">
          HINT: TYPE "HELP" IN THE TERMINAL FOR INSTRUCTIONS
        </span>
      </div>
    </div>
  );
};

export default NavBar;
