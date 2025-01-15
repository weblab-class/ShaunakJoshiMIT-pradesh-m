import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { TerminalProvider } from "./components/modules/TerminalContext";

import NotFound from "./components/pages/NotFound";
import HomePage from "./components/pages/Homepage";
import ProfilePage from "./components/pages/ProfilePage"
import SettingsPage from "./components/pages/SettingsPage";
import FriendsPage from "./components/pages/FriendsPage";
import LobbyPage from "./components/pages/LobbyPage";


import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'
import LoginPage from "./components/pages/LoginPage";


//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "465324171584-jgurca8sfthunf91v7q4agppmuoir1d0.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path = "/friends" element = {<FriendsPage />} />
        <Route path = "/settings" element = {<SettingsPage />} />
        <Route path = "/" element = {<LoginPage />} />
        <Route path="/lobby/:lobbyCode" element={<LobbyPage />} />

      </Route>
  )
);

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <TerminalProvider>
      <RouterProvider router={router} />
    </TerminalProvider>
  </GoogleOAuthProvider>
);


