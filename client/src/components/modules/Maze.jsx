import React, { useCallback, useState } from 'react';
import ReactFlow, { addEdge, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import FileNode from './FileNode'; 


export default function Maze({ gameObj }) {


  const onNodeClick = useCallback((event, node) => {
    if (!node?.data?.challenge) return;
    const { question, isImpossible } = node.data.challenge;
    alert(
      isImpossible
        ? `Rigged folder: ${question}`
        : `Folder ${node.id}: ${question}`
    );
  }, []);


  const nodeTypes = { folderNode: FileNode };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={gameObj.nodes}
        edges={gameObj.edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOnInit
        fitViewOptions={{ padding: .2}}
        minZoom={0.05}
        maxZoom={1.5}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={true}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background color="#00ff00" gap={16} />
        <Controls style={{ display: 'none' }} />
      </ReactFlow>
    </div>
  );
}
