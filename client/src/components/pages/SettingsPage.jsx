import React, { useState, useEffect, useContext } from "react";
import Layout from '../Layout.jsx';
import "../styles/SettingsPage.css";
import { UserContext } from "../App.jsx";
import { SocketContext } from "../modules/SocketContext.jsx";
import { AudioContext } from "../modules/AudioContext";

const SettingsPage = () => {
    const { userId } = useContext(UserContext);
    const socket = useContext(SocketContext);
    const { setBackgroundMusicVolume, setClickVolume, backgroundMusic } = useContext(AudioContext);

    const [soundVolume, setSoundVolume] = useState(backgroundMusic ? backgroundMusic.volume() * 100 : 50);
    const [fxVolume, setFxVolume] = useState(50);

    useEffect(() => {
        if (backgroundMusic) {
            setBackgroundMusicVolume(soundVolume / 200);
        }
    }, [soundVolume, setBackgroundMusicVolume, backgroundMusic]);

    useEffect(() => {
        setClickVolume(fxVolume / 100);
    }, [fxVolume, setClickVolume]);

    const handleSoundChange = (e) => {
        setSoundVolume(Number(e.target.value));
    };

    const handleFxChange = (e) => {
        setFxVolume(Number(e.target.value));
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
                        <label htmlFor="sound-slider">Background Music Volume</label>
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
                        <label htmlFor="fx-slider">Click FX Volume</label>
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