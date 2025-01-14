// src/index.js (or main.jsx)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { TerminalProvider } from "./components/modules/TerminalContext";

import NotFound from "./components/pages/NotFound";
import ProfilePage from "./components/pages/ProfilePage";
import FriendsPage from "./components/pages/FriendsPage";
import LobbyPage from "./components/pages/LobbyPage";

// Your actual Google Client ID
const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById("root"));

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "465324171584-jgurca8sfthunf91v7q4agppmuoir1d0.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/lobby/:lobbyCode" element={<LobbyPage />} />
    </Route>
  )
);

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
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
