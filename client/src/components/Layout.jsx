// Layout.jsx
import React from "react";
import NavBar from "./modules/NavBar.jsx";
import Terminal from "./modules/Terminal.jsx";

const Layout = ({ children, currentPage }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",    // Fill the viewport height
      }}
    >
      {/* Top NavBar */}
      <NavBar currentPage={currentPage} />

      {/* Main content area, scrollable, with extra bottom padding to avoid overlap */}
      <main
        style={{
          flex: 1,
          overflow: "auto",          // Enable scrolling within the main area
          paddingBottom: "220px",    // Space reserved for the Terminal
        }}
      >
        {children}
      </main>

      {/* Terminal Footer */}
      <div
        style={{
          flexShrink: 0,   // Prevent the terminal from shrinking
          height: "220px", // Match paddingBottom above, or however tall your Terminal is
          boxSizing: "border-box",
        }}
      >
        <Terminal />
      </div>
    </div>
  );
};

export default Layout;
