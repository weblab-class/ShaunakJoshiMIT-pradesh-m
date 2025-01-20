// FileNode.jsx
import React from 'react';
import { Handle } from 'reactflow';
import FolderIcon from '../../assets/foldericon.png'; // Adjust path as necessary

export default function FileNode({ data }) {
  return (
    <div style={{ width: '50px', height: '50px', position: 'relative' }}>
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
    </div>
  );
}
