import React, { useState, useEffect, useRef } from "react";
import "../styles/WordSwitcher.css";

const WordSwitcher = ({ words = [] }) => {
  const [currWord, setCurrWord] = useState(words[0] || "");
  const [glitch, setGlitch] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);

      setCurrWord(words[indexRef.current]);
      indexRef.current = (indexRef.current + 1) % words.length;

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
