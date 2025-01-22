import React, { useState, useEffect } from "react";

const Trivia = () => {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchTrivia = async () => {
    try {
      const response = await fetch(
        "https://opentdb.com/api.php?amount=1&category=19&difficulty=easy&type=multiple"
      );
      const data = await response.json();
      setFeedback("");

      if (data.results && data.results.length > 0) {
        const q = data.results[0];
        setQuestion(q.question);
        setCorrectAnswer(q.correct_answer);

        const allAnswers = [q.correct_answer, ...q.incorrect_answers];

        for (let i = allAnswers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
        }
        setChoices(allAnswers);
      }
    } catch (error) {
      console.error("Error fetching trivia:", error);
    }
  };

  useEffect(() => {
    fetchTrivia();
  }, []);

  const handleChoiceClick = (choice) => {
    if (choice === correctAnswer) {
      setFeedback("Correct!");
    } else {
      setFeedback("Wrong!");
    }
  };

  return (
    <div style={{ margin: "1rem" }}>
      <h2>Trivia Question</h2>
      <p
        dangerouslySetInnerHTML={{ __html: question }}
      />
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => handleChoiceClick(choice)}
          style={{ display: "block", marginBottom: "0.5rem" }}
          dangerouslySetInnerHTML={{ __html: choice }}
        />
      ))}
      {feedback && <p>{feedback}</p>}
      <button onClick={fetchTrivia} style={{ marginTop: "1rem" }}>
        Next Question
      </button>
    </div>
  );
};

export default Trivia;
