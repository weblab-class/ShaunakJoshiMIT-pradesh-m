import React, { useState, useEffect } from "react";

function Trivia() {
  const [question, setQuestion] = useState(null);
  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState("");

  // Helper function to shuffle the answer choices
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
        setFeedback(""); // Clear any previous feedback
      }
    } catch (error) {
      console.error("Error fetching trivia question:", error);
    }
  };

  // Check the provided answer letter against the correct answer
  const checkAnswer = (letter) => {
    const index = letter.toLowerCase().charCodeAt(0) - 97; // 'a' => 0, 'b' => 1, etc.
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

  // Expose the checkAnswer function globally so that the Terminal can access it.
  // In a full app consider using React Context instead.
  useEffect(() => {
    window.triviaCheckAnswer = (letter) => checkAnswer(letter);
    return () => {
      delete window.triviaCheckAnswer;
    };
  }, [question, choices]); // update the binding whenever the question changes

  // Fetch a question when the component mounts
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
