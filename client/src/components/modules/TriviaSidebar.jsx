import React from "react";
import "../styles/sidebar.css";
import "../styles/TriviaSidebar.css";

function scrambleString(str) {
  const characters = str.split("");
  for (let i = characters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }
  return characters.join("");
}

export default function TriviaSidebar({ gameObj, currentUserNickname }) {
  const currentPresidentNickname = gameObj.turnOrder[gameObj.currTurn];
  const hacker = gameObj.hacker;
  const nextLocation = gameObj.nextLocation;
  const triviaQuestion = gameObj.triviaQuestion;
  if (!triviaQuestion) {
    return (
      <div className="sidebar trivia-sidebar">
        <h2>Trivia Phase</h2>
        <p>Loading trivia question...</p>
      </div>
    );
  }
  const isImposter = gameObj.imposters.includes(currentUserNickname);
  const displayedQuestion = isImposter
    ? scrambleString(triviaQuestion.question)
    : triviaQuestion.question;
  let header;
  if (currentUserNickname === hacker) {
    header = <h3>Answer correctly to hack {nextLocation}!</h3>;
  } else {
    header = (
      <div>
        <h3>Hacker {hacker} is targeting {nextLocation}</h3>
        <h3>{hacker} must answer correctly to hack {nextLocation}</h3>
      </div>
    );
  }
  const answerChoices = triviaQuestion.choices.map((choice, i) => (
    <tr key={i}>
      <td>{i + 1}</td>
      <td>{choice}</td>
    </tr>
  ));
  return (
    <div className="sidebar trivia-sidebar">
      <h2>Trivia Challenge</h2>
      <section className="current-hacker">{header}</section>
      <section className="trivia-question">
        <h3 className={isImposter ? "glitch" : ""} data-text={displayedQuestion}>
          {displayedQuestion}
        </h3>
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
          <h3>Use <code>answer &lt;option-number&gt;</code></h3>
        ) : (
          <h3>Waiting for {hacker} to answer...</h3>
        )}
      </section>
    </div>
  );
}
