import React, { createContext, useEffect } from 'react';
import { ding, backgroundMusic } from '../utils/sounds';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const playDing = () => {
    ding.play();
  };

  const playBackgroundMusic = () => {
    if (!backgroundMusic.playing()) {
      backgroundMusic.play();
    }
  };

  const pauseBackgroundMusic = () => {
    if (backgroundMusic.playing()) {
      backgroundMusic.pause();
    }
  };

  const setBackgroundMusicVolume = (volume) => {
    backgroundMusic.volume(volume);
  };

  const setClickVolume = (volume) => {
    ding.volume(volume);
  };

  useEffect(() => {
    playBackgroundMusic();
    return () => {
      backgroundMusic.stop();
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        playDing,
        playBackgroundMusic,
        pauseBackgroundMusic,
        setBackgroundMusicVolume,
        setClickVolume,
        backgroundMusic,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
