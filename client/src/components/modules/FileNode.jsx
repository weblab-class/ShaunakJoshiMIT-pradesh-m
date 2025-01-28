import React from 'react';
import { Handle } from 'reactflow';
import FolderIcon from '../../assets/foldericon.png';

export default function FileNode({ data }) {
  const { label, isCurrent, isAllowedMove, isGoal } = data || {};

  // Decide on a border style based on flags, with a priority order
  let borderStyle = 'none';

  // Highlight the goal (bottom-right) in blue by default
  if (isGoal) {
    borderStyle = '2px solid blue';
  }

  // If it's the current location, highlight in red (takes priority over goal)
  if (isCurrent) {
    borderStyle = '2px solid red';
  } 
  // If it's an allowed move, highlight in green (if not current)
  else if (isAllowedMove) {
    borderStyle = '2px solid green';
  }

  return (
    <div style={{ width: '50px', height: '50px', position: 'relative', border: borderStyle }}>
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

      {/* Node Label */}
      <div style={{
        position: 'absolute',
        bottom: '-18px',
        left: '0',
        width: '100%',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {label}
      </div>
    </div>
  );
}
