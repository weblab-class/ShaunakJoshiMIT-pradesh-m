// WordSwitcher.jsx
import React, { useState, useEffect, useRef } from "react";
import "../styles/WordSwitcher.css"; // New CSS file for glitch effect (see below)

const WordSwitcher = ({ words = [] }) => {
  const [currWord, setCurrWord] = useState(words[0] || "");
  const [glitch, setGlitch] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger the glitch animation
      setGlitch(true);

      // Switch the word
      setCurrWord(words[indexRef.current]);
      indexRef.current = (indexRef.current + 1) % words.length;

      // Remove glitch class after 300ms (length of glitch animation)
      setTimeout(() => {
        setGlitch(false);
      }, 300);
    }, 1600);

    return () => clearInterval(interval);
  }, [words]);

  return (
    <h1 className={`switch-word ${glitch ? "glitch" : ""}`}>
      {currWord}
    </h1>
  );
};

export default WordSwitcher;
