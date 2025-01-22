import React, { useState, useEffect } from "react";

function Trivia() {
  const [question, setQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState("");

  const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const fetchQuestion = async () => {
    try {
      const res = await fetch("https://opentdb.com/api.php?amount=1&encode=url3986");
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const q = data.results[0];
        const incorrect = q.incorrect_answers;
        const correct = q.correct_answer;
        const allChoices = shuffle([...incorrect, correct]);
        setQuestion(q);
        setChoices(allChoices);
        setFeedback("");
      }
    } catch (error) {
      console.error("Error fetching trivia question:", error);
    }
  };

  const checkAnswer = (letter) => {
    const index = letter.toLowerCase().charCodeAt(0) - 97;
    if (index < 0 || index >= choices.length) {
      setFeedback("Invalid option. Please try 'answer a', 'answer b', etc.");
      return;
    }
    if (choices[index] === question.correct_answer) {
      setFeedback("Correct!");
    } else {
      setFeedback("Incorrect.");
    }
  };

  useEffect(() => {
    window.triviaCheckAnswer = (letter) => checkAnswer(letter);
    return () => {
      delete window.triviaCheckAnswer;
    };
  }, [question, choices]);

  useEffect(() => {
    fetchQuestion();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      {question ? (
        <div>
          <h2>{decodeURIComponent(question.question)}</h2>
          <ul>
            {choices.map((choice, idx) => (
              <li key={idx}>
                <strong>{String.fromCharCode(97 + idx)}:</strong>{" "}
                {decodeURIComponent(choice)}
              </li>
            ))}
          </ul>
          {feedback && <p>{feedback}</p>}
          <button onClick={fetchQuestion}>Next Question</button>
        </div>
      ) : (
        <p>Loading question...</p>
      )}
    </div>
  );
}

export default Trivia;
