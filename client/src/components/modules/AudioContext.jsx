import React, { createContext } from 'react';
import { ding, backgroundMusic } from '../utils/sounds';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const playDing = () => {
    ding.play();
  };

  const playBackgroundMusic = () => {
    backgroundMusic.play();
  };

  const pauseBackgroundMusic = () => {
    backgroundMusic.pause();
  };

  return (
    <AudioContext.Provider
      value={{
        playDing,
        playBackgroundMusic,
        pauseBackgroundMusic,
        backgroundMusic,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
