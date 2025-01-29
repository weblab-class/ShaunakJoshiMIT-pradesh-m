
import React from "react";
import NavBar from "./modules/NavBar.jsx";
import Terminal from "./modules/Terminal.jsx";

const Layout = ({ children, currentPage }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <NavBar currentPage={currentPage} />

      <main
        style={{
          flex: 1,
          overflow: "auto",
          paddingBottom: "0px",
        }}
      >
        {children}
      </main>

      <div
        style={{
          flexShrink: 0,
          height: "220px",
          boxSizing: "border-box",
        }}
      >
        <Terminal />
      </div>
    </div>
  );
};

export default Layout;
