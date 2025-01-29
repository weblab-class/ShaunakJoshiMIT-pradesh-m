import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import Maze from './Maze';

export default function MazeWrapper({ gameObj }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <Maze gameObj={gameObj} />
      </ReactFlowProvider>
    </div>
  );
}
