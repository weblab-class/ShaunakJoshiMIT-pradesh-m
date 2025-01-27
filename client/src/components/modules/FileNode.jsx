import React from 'react';
import { Handle } from 'reactflow';
import FolderIcon from '../../assets/foldericon.png';

export default function FileNode({ data }) {
  const { label, isCurrent, isAllowedMove } = data || {};

  // Decide on a border color or style based on flags
  let borderStyle = 'none';
  if (isCurrent) {
    // Red border if this is the current node
    borderStyle = '2px solid red';
  } else if (isAllowedMove) {
    // Green border if user can move to this node (in MOVE phase and adjacent)
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
