import React from "react";
import "../styles/NavBar.css";
import siteLogo from "../assets/images/site-logo.png";

const NavBar = ({ currentPage }) => {
  const pageName =
    currentPage.charAt(0).toUpperCase() + currentPage.slice(1).toLowerCase();

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src={siteLogo} alt="Site Logo" className="navbar-icon" />
      </div>

      <div className="navbar-current-page">
        Currently on: <span className="navbar-page-highlight">{pageName}</span>
      </div>

      <div className="navbar-hint-animated">
        <span className="marquee">
          HINT: TYPE "HELP" IN THE TERMINAL FOR INSTRUCTIONS
        </span>
      </div>
    </div>
  );
};

export default NavBar;
