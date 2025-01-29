import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import FileNode from './FileNode';

export default function Maze({ gameObj }) {
  const [displayNodes, setDisplayNodes] = useState([]);

  const buildAdjacencyMap = (nodes, edges) => {
    const map = {};
    nodes.forEach(n => { map[n.id] = []; });
    edges.forEach(({ source, target }) => {
      map[source]?.push(target);
      map[target]?.push(source);
    });
    return map;
  };

  useEffect(() => {
    if (!gameObj || !gameObj.nodes || !gameObj.edges) return;

    const adjacencyMap = buildAdjacencyMap(gameObj.nodes, gameObj.edges);
    const currentLocation = gameObj.location || '0-0';
    const isMovePhase = (gameObj.phase || '').toUpperCase() === 'MOVE';

    const goalId = `${gameObj.rows - 1}-${gameObj.cols - 1}`;

    const newNodes = gameObj.nodes.map((node) => {
      const isCurrent = node.id === currentLocation;
      const isGoal = node.id === goalId;

      let isAllowedMove = false;
      if (isMovePhase && !isCurrent) {
        const neighbors = adjacencyMap[currentLocation] || [];
        isAllowedMove = neighbors.includes(node.id);
      }

      return {
        ...node,
        data: {
          ...node.data,
          label: node.id,
          isCurrent,
          isGoal,
          isAllowedMove,
        },
      };
    });

    setDisplayNodes(newNodes);
  }, [gameObj]);

  const onNodeClick = useCallback((evt, node) => {
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
        nodes={displayNodes}
        edges={gameObj.edges}
        onNodeClick={onNodeClick}
        fitView
        fitViewOnInit
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={1.5}
        panOnDrag
        zoomOnScroll
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background color="#00ff00" gap={16} />
        <Controls style={{ display: 'none' }} />
      </ReactFlow>
    </div>
  );
}
