// RulesPage.jsx
import React from "react";
import Layout from "../Layout.jsx";
import "../styles/RulesPage.css";

const RulesPage = () => {
  return (
    <Layout currentPage="rules">
    <div className="Rules-Page">
      <header className="Rules-Header">
        <h1>Hacker vs FBI: Game Rules</h1>
      </header>

      <section className="Rules-Section">
        <h2>Premise</h2>
        <p>
          A group of <strong>Hackers</strong> is racing to reach the bottom-rightmost folder of a grid. However, among their ranks lurk <strong>FBI Impostors</strong> whose mission is to sabotage the Hackers from within. The impostors aim to block the path, delete critical folders, and frame innocent players to prevent the Hackers from succeeding.
        </p>
      </section>

      <section className="Rules-Section">
        <h2>Objective</h2>
        <ul>
          <li>
            <strong>Hackers:</strong> Navigate from the top-left folder to the bottom-right folder before time runs out and while valid paths remain.
          </li>
          <li>
            <strong>FBI Impostors:</strong> Prevent the Hackers from reaching their goal by deleting folders, steering them onto dead ends, and rigging trivia questions.
          </li>
        </ul>
      </section>

      <section className="Rules-Section">
        <h2>Gameplay Flow</h2>
        <ol>
          <li>
            <strong>Presidential Appointment:</strong> At the start of each round, a <em>President</em> is selected in a consistent turn-based order. The President appoints a <em>Hacker</em> for that round.
          </li>
          <li>
            <strong>Voting:</strong> The group votes to approve or reject the appointed Hacker. If approved, the Hacker proceeds to choose the next folder. If rejected, the presidency passes to the next player, and a new appointment occurs.
          </li>
          <li>
            <strong>Movement:</strong> The approved Hacker selects an adjacent folder (node) to move to from the current position.
          </li>
          <li>
            <strong>Trivia Hack:</strong> The Hacker must answer a trivia question correctly to successfully hack the chosen folder.
            <ul>
              <li>If answered correctly, the group moves to the selected folder.</li>
              <li>If answered incorrectly, the selected folder is deleted from the grid, and the group remains in their current position.</li>
            </ul>
          </li>
        </ol>
      </section>

      <section className="Rules-Section">
        <h2>FBI Impostor Mechanics</h2>
        <ul>
          <li>
            <strong>Sabotage:</strong> Impostors can intentionally answer trivia questions incorrectly to delete folders or frame other players.
          </li>
          <li>
            <strong>Rigging Hacks:</strong> Impostors have a limited number of opportunities to rig appointed Hackers, forcing them to fail trivia questions and potentially drawing suspicion onto themselves.
          </li>
        </ul>
      </section>

      <section className="Rules-Section">
        <h2>Winning Conditions</h2>
        <ul>
          <li>
            <strong>Hackers Win:</strong> Successfully reach the bottom-rightmost folder before time expires and while at least one valid path exists.
          </li>
          <li>
            <strong>FBI Impostors Win:</strong> Time runs out, or all viable paths to the final folder are deleted, preventing the Hackers from succeeding.
          </li>
        </ul>
      </section>

      <section className="Rules-Section">
        <h2>Time & Path Constraints</h2>
        <ul>
          <li>Each phase (Appointment, Voting, Move, Trivia, Result) is timed to ensure smooth gameplay.</li>
          <li>The overall game has a master countdown timer. Once it reaches zero, the game ends immediately.</li>
          <li>
            Folders (nodes) can be deleted upon failed trivia hacks, reducing future movement options and potentially blocking paths.
          </li>
        </ul>
      </section>

      <section className="Rules-Section conclusion">
        <h3>Good Luck!</h3>
        <p>
          Stay vigilant: you never know when an ally might be an FBI agent in disguise, waiting for the perfect moment to sabotage your mission. Navigate wisely, answer accurately, and work together to outsmart the impostors. Have fun, and hack responsibly!
        </p>
      </section>
    </div>
    </Layout>
  );
};

export default RulesPage;
