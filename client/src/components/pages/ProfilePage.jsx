// ProfilePage.jsx

import React, { useState, useContext, useEffect } from "react";
import Layout from '../Layout.jsx';
import "../styles/ProfilePage.css";
import { UserContext } from "../App.jsx";
import { get, post } from "../..//utilities"
import { SocketContext } from "../modules/SocketContext.jsx";

const ProfilePage = () => {
    const { userId } = useContext(UserContext);
    const [user, setUser] = useState(null);
    const socket = useContext(SocketContext);

    useEffect(() => {
        // Fetch user data based on userId
        get("/api/user", { userid: userId }).then((userObj) => {
            setUser(userObj);
        });
    }, [userId]);

    useEffect(() => {
        // Example: Listen for a user data update event
        socket.on("userDataUpdated", (data) => {
            if (data.userid === userId) {
                get("/api/user", { userid: userId }).then((userObj) => {
                    setUser(userObj);
                });
            }
        });

        return () => {
            socket.off("userDataUpdated");
        };
    }, [userId, socket]);

    if (!user) {
        return (
            <Layout currentPage="profile">
                <div className="profile-container">
                    <p className="loading">Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentPage="profile">
            <div className="profile-container">
                <header className="profile-header">
                    <h1>User Profile</h1>
                </header>

                <section className="user-info-section">
                    <h2>Basic Information</h2>
                    <div className="user-info">
                        <p><strong>User ID:</strong> {user.id}</p>
                        <p><strong>Nickname:</strong> {user.nickname || 'N/A'}</p>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default ProfilePage;
