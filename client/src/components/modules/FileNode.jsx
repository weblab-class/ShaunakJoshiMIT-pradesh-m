import React from 'react';
import { Handle } from 'reactflow';
import FolderIcon from '../assets/images/assets/foldericon.png';

export default function FileNode({ data }) {
  const { label, isCurrent, isAllowedMove, isGoal } = data || {};

  let border = '2px solid transparent';
  let boxShadow = 'none';

  if (isCurrent) {
    border = '2px solid #00ffff';
  }
  else if (isGoal) {
    border = '2px solid #00ff00';  
  }
  else if (isAllowedMove) {
    border = '2px dashed #00ff00';
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
      <Handle
        type="target"
        position="left"
        id="left"
        style={{ background: '#00ff00' }}
      />

      <Handle
        type="source"
        position="right"
        id="right"
        style={{ background: '#00ff00' }}
      />

      <img
        src={FolderIcon}
        alt="Folder Icon"
        style={{ width: '100%', height: '100%' }}
      />

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
