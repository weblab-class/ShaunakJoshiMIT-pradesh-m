// src/index.js (or main.jsx)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import HomePage from "./components/pages/HomePage";
import NotFound from "./components/pages/NotFound";
import ProfilePage from "./components/pages/ProfilePage";
import FriendsPage from "./components/pages/FriendsPage";

import SettingsPage from "./components/pages/SettingsPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Your actual Google Client ID
const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path= "/profile" element={<ProfilePage />} />
          <Route path = "/friends" element = {<FriendsPage />} />
          <Route path = "/settings" element = {<SettingsPage />} />          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
