import React from 'react';
import '../styles/CommandHints.css'; 

const CommandHints = ({ commands }) => {
  return (
    <div className="command-hints">
      <div className="command-header">
        <span className="command-title">Terminal Commands</span>
      </div>
      <ul className="command-list">
        {commands.map((cmd, index) => (
          <li key={index} className="command-item">
            <span className="command-prefix">$</span> {cmd}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommandHints;
