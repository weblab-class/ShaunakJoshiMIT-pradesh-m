import React, { useState, useEffect, useContext } from "react";
import Layout from '../Layout.jsx';
import "../styles/SettingsPage.css";
import { UserContext } from "../App.jsx";
import { SocketContext } from "../modules/SocketContext.jsx";
import { AudioContext } from "../modules/AudioContext";
import CommandHints from "../components/CommandHints.jsx";

const SettingsPage = () => {
    const { userId } = useContext(UserContext);
    const socket = useContext(SocketContext);
    const { setBackgroundMusicVolume, setClickVolume, backgroundMusic } = useContext(AudioContext);

    const [soundVolume, setSoundVolume] = useState(() => {
        const savedSoundVolume = localStorage.getItem('soundVolume');
        return savedSoundVolume
          ? Number(savedSoundVolume)
          : (backgroundMusic ? backgroundMusic.volume() * 100 : 50);
    });

    const [fxVolume, setFxVolume] = useState(() => {
        const savedFxVolume = localStorage.getItem('fxVolume');
        return savedFxVolume ? Number(savedFxVolume) : 50;
    });

    useEffect(() => {
        if (backgroundMusic) {
            setBackgroundMusicVolume(soundVolume / 100);
            localStorage.setItem('soundVolume', soundVolume);
        }
    }, [soundVolume, setBackgroundMusicVolume, backgroundMusic]);

    useEffect(() => {
        setClickVolume(fxVolume / 100);
        localStorage.setItem('fxVolume', fxVolume);
    }, [fxVolume, setClickVolume]);

    const handleSoundChange = (e) => {
        setSoundVolume(Number(e.target.value));
    };

    const handleFxChange = (e) => {
        setFxVolume(Number(e.target.value));
    };

    // Define the commands specific to SettingsPage
    const commands = [
        "cd home",
        "cd profile",
        "cd friends"
    ];

    return (
        <Layout currentPage="settings">
            <div className="settings-container">

                <div className="retro-bg"></div>

                <header className="settings-header">
                    <h1>Settings</h1>
                </header>

                <section className="settings-section">
                    <h2>Audio Settings</h2>

                    <div className="slider-container">
                        <label htmlFor="sound-slider">Music Volume</label>
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
            <CommandHints commands={commands} />
        </Layout>
    );
};

export default SettingsPage;
