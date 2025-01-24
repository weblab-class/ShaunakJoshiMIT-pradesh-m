import React, { useState, useContext } from "react";
import Layout from '../Layout.jsx';
import "../styles/SettingsPage.css";
import { UserContext } from "../App.jsx";
import { SocketContext } from "../modules/SocketContext.jsx";

const SettingsPage = () => {
    const { userId } = useContext(UserContext);
    const socket = useContext(SocketContext);

    const [soundVolume, setSoundVolume] = useState(50);
    const [fxVolume, setFxVolume] = useState(50);

    const handleSoundChange = (e) => {
        setSoundVolume(e.target.value);
    };

    const handleFxChange = (e) => {
        setFxVolume(e.target.value);
    };

    return (
        <Layout currentPage="settings">
            <div className="settings-container">
                <header className="settings-header">
                    <h1>Settings</h1>
                </header>

                <section className="settings-section">
                    <h2>Audio Settings</h2>
                    
                    <div className="slider-container">
                        <label htmlFor="sound-slider">Sound Volume</label>
                        <input
                            type="range"
                            id="sound-slider"
                            min="0"
                            max="100"
                            value={soundVolume}
                            onChange={handleSoundChange}
                            className="slider"
                        />
                        <span>{soundVolume}%</span>
                    </div>

                    <div className="slider-container">
                        <label htmlFor="fx-slider">FX Volume</label>
                        <input
                            type="range"
                            id="fx-slider"
                            min="0"
                            max="100"
                            value={fxVolume}
                            onChange={handleFxChange}
                            className="slider"
                        />
                        <span>{fxVolume}%</span>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default SettingsPage;
