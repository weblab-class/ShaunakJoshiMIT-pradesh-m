import React from 'react';
import { Handle } from 'reactflow';
import FolderIcon from '../assets/images/assets/foldericon.png';

export default function FileNode({ data }) {
  const { label, isCurrent, isAllowedMove, isGoal } = data || {};

  // Basic border style
  let border = '2px solid transparent';
  let boxShadow = 'none';

  // If it's the current node => use a bright/cyan border and label "CURRENT" on top
  if (isCurrent) {
    border = '2px solid #00ffff';  // retro blue/cyan
  }
  // If it's the goal => use bright green border and label "GOAL" at the bottom
  else if (isGoal) {
    border = '2px solid #00ff00';  // retro green
  }
  // If it's an allowed move => highlight with a neon green effect
  else if (isAllowedMove) {
    border = '2px dashed #00ff00';
    // Add a neon glow effect
    boxShadow = `
      0 0 5px #00ff00,
      0 0 10px #00ff00,
      0 0 15px #00ff00
    `;
  }

  return (
    <div
      style={{
        width: '50px',
        height: '50px',
        position: 'relative',
        border,
        boxShadow,
      }}
    >
      {/* Target Handle on the Left */}
      <Handle
        type="target"
        position="left"
        id="left"
        style={{ background: '#00ff00' }}
      />

      {/* Source Handle on the Right */}
      <Handle
        type="source"
        position="right"
        id="right"
        style={{ background: '#00ff00' }}
      />

      {/* Folder Icon */}
      <img
        src={FolderIcon}
        alt="Folder Icon"
        style={{ width: '100%', height: '100%' }}
      />

      {/* If current, label above */}
      {isCurrent && (
        <div
          style={{
            position: 'absolute',
            top: '-18px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#00ffff',
          }}
        >
          CURRENT
        </div>
      )}

      {/* Node ID in the middle/bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '-18px',
          left: '0',
          width: '100%',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {label}
      </div>

      {/* If goal, label “GOAL” below */}
      {isGoal && (
        <div
          style={{
            position: 'absolute',
            bottom: '-32px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#00ff00',
          }}
        >
          GOAL
        </div>
      )}
    </div>
  );
}
