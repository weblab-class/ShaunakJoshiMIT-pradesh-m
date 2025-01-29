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

  if (!triviaQuestion) {
    return (
      <div className="trivia-sidebar">
        <h2>Trivia Phase</h2>
        <p>Loading trivia question...</p>
      </div>
    );
  }

  // The heading changes if you are the hacker vs. a bystander
  let header;
  if (currentUserNickname === hacker) {
    header = (
      <h3>
        Answer correctly to hack <strong>{nextLocation}</strong>!
      </h3>
    );
  } else {
    header = (
      <div>
        <h3>
          Hacker <strong>{hacker}</strong> is targeting{" "}
          <strong>{nextLocation}</strong>
        </h3>
        <h3>
          {hacker} must answer correctly to hack <strong>{nextLocation}</strong>
        </h3>
      </div>
    );
  }

  // Build the answer table rows
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
          <tbody>{answerChoices}</tbody>
        </table>
      </section>

      <section className="instructions">
        {currentUserNickname === hacker ? (
          <h3>
            Use the terminal: <code>answer &lt;option-number&gt;</code>
          </h3>
        ) : (
          <h3>
            Waiting for <strong>{hacker}</strong> to answer...
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
