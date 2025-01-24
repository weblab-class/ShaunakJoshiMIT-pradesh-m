// TriviaSidebar.jsx
import React from "react";
import PropTypes from "prop-types";
import "../styles/TriviaSidebar.css";

const TriviaSidebar = ({ gameObj, currentUserNickname }) => {
  const currentPresidentNickname = gameObj.turnOrder[gameObj.currTurn];
  const players = gameObj.user_ids;
  const hacker = gameObj.hacker;
  const nextLocation = gameObj.nextLocation;
  const triviaQuestion = gameObj.triviaQuestion;

  // Handle case where triviaQuestion might not be available
  if (!triviaQuestion) {
    return (
      <div className="trivia-sidebar">
        <h2>Trivia Phase</h2>
        <p>Loading trivia question...</p>
      </div>
    );
  }

  // Determine the header based on whether the user is the hacker
  let header;

  if (currentUserNickname === hacker) {
    header = (
      <h3>
        Answer the following question correctly to move to{" "}
        <strong>{nextLocation}</strong>
      </h3>
    );
  } else {
    header = (
      <div>
        <h3>
          Hacker <strong>{hacker}</strong> proposes to target{" "}
          <strong>{nextLocation}</strong>
        </h3>
        <h3>
          {hacker} must answer the following question correctly to move to{" "}
          <strong>{nextLocation}</strong>
        </h3>
      </div>
    );
  }

  // Map through the trivia choices to create table rows
  const answerChoices = triviaQuestion.choices.map((choice, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{choice}</td>
    </tr>
  ));

  return (
    <div className="trivia-sidebar">
      <h2>Trivia Challenge</h2>

      <section className="current-hacker">
        {header}
      </section>

      <section className="trivia-question">
        <h3>{triviaQuestion.question}</h3>
        <table className="answer-choices">
          <thead>
            <tr>
              <th>Option</th>
              <th>Choice</th>
            </tr>
          </thead>
          <tbody>
            {answerChoices}
          </tbody>
        </table>
      </section>

      <section className="instructions">
        {currentUserNickname === hacker ? (
          <h3>
            Answer the question using the terminal:{" "}
            <code>answer &lt;option-index&gt;</code>
          </h3>
        ) : (
          <h3>
            Waiting for <strong>{hacker}</strong> to answer the question.
          </h3>
        )}
      </section>
    </div>
  );
};

TriviaSidebar.propTypes = {
  gameObj: PropTypes.shape({
    turnOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
    currTurn: PropTypes.number.isRequired,
    user_ids: PropTypes.arrayOf(PropTypes.string).isRequired,
    hacker: PropTypes.string,
    nextLocation: PropTypes.string,
    triviaQuestion: PropTypes.shape({
      question: PropTypes.string.isRequired,
      choices: PropTypes.arrayOf(PropTypes.string).isRequired,
      correctChoice: PropTypes.number.isRequired,
    }),
  }).isRequired,
  currentUserNickname: PropTypes.string.isRequired,
};

export default TriviaSidebar;
