import React from "react";
import "../styles/Sidebar.css";
import "../styles/ResultSidebar.css";

export default function ResultSidebar({ gameObj, currentUserNickname }) {
  const { triviaQuestion, hackerAnswer, nextLocation } = gameObj;
  if (!triviaQuestion || hackerAnswer === undefined) {
    return (
      <div className="sidebar result-sidebar">
        <h2>Result Phase</h2>
        <p>Loading results...</p>
      </div>
    );
  }
  const outcome = Number(hackerAnswer) - 1 === triviaQuestion.correctChoice;
  const selectedAnswer = triviaQuestion.choices[Number(hackerAnswer) - 1];
  const correctAnswer = triviaQuestion.choices[triviaQuestion.correctChoice];
  return (
    <div className="sidebar result-sidebar">
      <h2>Trivia Results</h2>
      <section className="trivia-details">
        <h3>Trivia Question</h3>
        <p>{triviaQuestion.question}</p>
      </section>
      <section className="answers">
        <h3>Your Answer</h3>
        <p>{selectedAnswer || "No answer provided."}</p>
        <h3>Correct Answer</h3>
        <p>{correctAnswer}</p>
      </section>
      <section className="result-message">
        {outcome ? (
          <h3 className="success">Move to {nextLocation} was successful.</h3>
        ) : (
          <h3 className="failure">Move to {nextLocation} was unsuccessful. The folder has been corrupted.</h3>
        )}
      </section>
    </div>
  );
}
