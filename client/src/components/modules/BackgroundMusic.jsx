import React, { useState, useContext } from 'react';
import { AudioContext } from '../context/AudioContext'; // Import AudioContext
import '../styles/BackgroundMusic.css'; // Import CSS for styling

const BackgroundMusic = () => {
  const { playBackgroundMusic, pauseBackgroundMusic, backgroundMusic } = useContext(AudioContext);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (isPlaying) {
      pauseBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
    setIsPlaying(!isPlaying); 
  };

  return (
    <div className="background-music-controls">
      <button onClick={toggleMusic} className="music-toggle-button">
        {isPlaying ? 'Pause Music' : 'Play Music'}
      </button>
    </div>
  );
};

export default BackgroundMusic;
