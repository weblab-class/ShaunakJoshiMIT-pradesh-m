import React from "react";
import PropTypes from "prop-types";
import "../styles/ResultSidebar.css";

const ResultSidebar = ({ gameObj, currentUserNickname }) => {
  const { triviaQuestion, hackerAnswer, nextLocation } = gameObj;
  const outcome = Number(hackerAnswer) - 1 === triviaQuestion.correctChoice;

  if (!triviaQuestion || hackerAnswer === undefined ) {
    return (
      <div className="result-sidebar">
        <h2>Result Phase</h2>
        <p>Loading results...</p>
      </div>
    );
  }
  const isHacker = currentUserNickname === gameObj.hacker;

  const selectedAnswer = triviaQuestion.choices[Number(hackerAnswer) - 1];
  const correctAnswer = triviaQuestion.choices[triviaQuestion.correctChoice];

  return (
    <div className="result-sidebar">
      <h2>Trivia Results</h2>

      <section className="trivia-details">
        <h3>Trivia Question</h3>
        <p>{triviaQuestion.question}</p>
      </section>

      <section className="answers">
        <h3>Your Answer</h3>
        <p>{selectedAnswer ? selectedAnswer : "No answer provided."}</p>

        <h3>Correct Answer</h3>
        <p>{correctAnswer}</p>
      </section>

      <section className="result-message">
        {(outcome) ? (
          <h3 className="success">
            Move to <strong>{nextLocation}</strong> was <strong>successful!</strong>
          </h3>
        ) : (
          <h3 className="failure">
            Move to <strong>{nextLocation}</strong> was <strong>unsuccessful</strong>. The proposed folder has been corrupted and is no longer available.
          </h3>
        )}
      </section>
    </div>
  );
};

ResultSidebar.propTypes = {
  gameObj: PropTypes.shape({
    triviaQuestion: PropTypes.shape({
      question: PropTypes.string.isRequired,
      choices: PropTypes.arrayOf(PropTypes.string).isRequired,
      correctChoice: PropTypes.number.isRequired,
    }),
    hacker: PropTypes.string.isRequired,
    hackerAnswer: PropTypes.number,
    outcome: PropTypes.oneOf(["success", "failure"]).isRequired,
    nextLocation: PropTypes.string.isRequired,
  }).isRequired,
  currentUserNickname: PropTypes.string.isRequired,
};

export default ResultSidebar;
