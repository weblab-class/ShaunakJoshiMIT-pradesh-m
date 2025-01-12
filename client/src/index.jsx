import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { GoogleOAuthProvider } from '@react-oauth/google';

import NotFound from "./components/pages/NotFound";
import HomePage from "./components/pages/Homepage";
import ProfilePage from "./components/pages/ProfilePage"
import SettingsPage from "./components/pages/SettingsPage";
import FriendsPage from "./components/pages/FriendsPage";
import HelpPage from "./components/pages/HelpPage";


import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'


//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "465324171584-jgurca8sfthunf91v7q4agppmuoir1d0.apps.googleusercontent.com";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<NotFound />} element={<App />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path = "/friends" element = {<FriendsPage />} />
        <Route path = "/help" element = {<HelpPage />} />
        <Route path = "/settings" element = {<SettingsPage />} />

      </Route>
  )
);

// renders React Component "Root" into the DOM element with ID "root"
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);
