// Maze.jsx
import React, { useCallback, useState } from 'react';
import ReactFlow, { addEdge, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import FileNode from './FileNode'; // Your updated custom node with handles

// Helper: Generate Node Grid
function generateGridNodes(rows, cols) {
  const nodes = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `${row}-${col}`;
      // Evenly spaced - adjust as needed
      const xPos = col * 100; // Reduced spacing for better fit
      const yPos = row * 100;

      // Example rigged logic
      const isRigged = Math.random() < 0.1;
      const challenge = isRigged
        ? { question: 'Impossible question!', isImpossible: true }
        : { question: `Question for folder (${row}, ${col})`, isImpossible: false };

      nodes.push({
        id,
        type: 'folderNode', // Reference to your custom node
        position: { x: xPos, y: yPos },
        data: { challenge },
        draggable: false,
      });
    }
  }
  return nodes;
}

// Helper: Generate Straight Edges
function generateGridEdges(rows, cols) {
  const edges = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sourceId = `${row}-${col}`;

      // Right Neighbor
      if (col + 1 < cols) {
        const targetId = `${row}-${col + 1}`;
        edges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'right',   // Connect to the right handle of the source
          targetHandle: 'left',    // Connect to the left handle of the target
          type: 'default',
          style: { stroke: '#00ff00', strokeWidth: 2 },
        });
      }

      // Down Neighbor
      if (row + 1 < rows) {
        const targetId = `${row + 1}-${col}`;
        edges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: 'bottom',  // Optional: Define additional handles if needed
          targetHandle: 'top',     // Optional: Define additional handles if needed
          type: 'default',
          style: { stroke: '#00ff00', strokeWidth: 2 },
        });
      }
    }
  }
  return edges;
}

export default function Maze({ rows, cols }) {
  const [nodes] = useState(() => generateGridNodes(rows, cols));
  const [edges] = useState(() => generateGridEdges(rows, cols));

  // Node Click Handler
  const onNodeClick = useCallback((event, node) => {
    if (!node?.data?.challenge) return;
    const { question, isImpossible } = node.data.challenge;
    alert(
      isImpossible
        ? `Rigged folder: ${question}`
        : `Folder ${node.id}: ${question}`
    );
  }, []);

  // No need for onConnect since edges are static
  // If you want to allow dynamic connections, you can implement onConnect

  // Define node types
  const nodeTypes = { folderNode: FileNode };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOnInit
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={1.5}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        {/* Neon green grid background */}
        <Background color="#00ff00" gap={16} />
        {/* Hide the controls since user cannot interact */}
        <Controls style={{ display: 'none' }} />
      </ReactFlow>
    </div>
  );
}
