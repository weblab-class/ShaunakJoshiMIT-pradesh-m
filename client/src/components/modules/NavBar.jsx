// NavBar.jsx
import React from "react";
import "../styles/NavBar.css";
import siteLogo from "../assets/images/assets/site-logo.png";

const NavBar = ({ currentPage }) => {
  // Capitalize the current page for display
  const pageName =
    currentPage.charAt(0).toUpperCase() + currentPage.slice(1).toLowerCase();

  return (
    <div className="navbar">
      {/* Logo Section */}
      <div className="navbar-logo">
        <img src={siteLogo} alt="Site Logo" className="navbar-icon" />
        {/* Optional: Add logo text next to the icon */}
        {/* <span className="navbar-logo-text">Hacker</span> */}
      </div>

      {/* Centered Current Page Display */}
      <div className="navbar-current-page">
        Currently on: <span className="navbar-page-highlight">{pageName}</span>
      </div>

      {/* Animated Hint Bar */}
      <div className="navbar-hint-animated">
        <span className="marquee">
          HINT: TYPE "HELP" IN THE TERMINAL FOR INSTRUCTIONS
        </span>
      </div>
    </div>
  );
};

export default NavBar;
