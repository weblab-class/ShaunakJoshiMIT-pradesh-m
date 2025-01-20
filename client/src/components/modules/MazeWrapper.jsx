import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import Maze from './Maze';

export default function MazeWrapper({ rows = 5, cols = 5 }) {
  return (
    // Let Maze fill its parent's area
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <Maze rows={rows} cols={cols} />
      </ReactFlowProvider>
    </div>
  );
}
