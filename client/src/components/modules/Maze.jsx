import React, { useState, useEffect } from "react";
import FileNode from "./FileNode"; // Adjust the path based on your project structure
import "./Maze.css"; // Import the CSS for styling

function createMaze(rows, cols, categories) {
    let out = [];
    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            let difficulty = Math.ceil(Math.random() * 9);
            let category = Math.ceil(Math.random() * categories);
            row.push({ difficulty, category });
        }
        out.push(row);
    }
    return out;
}

const Maze = (props) => {
    const [maze, setMaze] = useState(null);

    useEffect(() => {
        setMaze(createMaze(props.rows, props.cols, props.categories));
    }, [props.rows, props.cols, props.categories]);

    if (!maze) {
        return <div>Loading maze...</div>;
    }

    return (
        <div
            className="maze-container"
            style={{ gridTemplateColumns: `repeat(${props.cols}, 1fr)` }}
        >
            {maze.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} className="maze-cell-container">
                        {/* Folder Node */}
                        <div className="maze-cell">
                            <FileNode difficulty={cell.difficulty} category={cell.category} />
                        </div>

                        {/* Horizontal Edge */}
                        {colIndex < row.length - 1 && (
                            <div className="maze-edge-horizontal"></div>
                        )}

                        {/* Vertical Edge */}
                        {rowIndex < maze.length - 1 && (
                            <div className="maze-edge-vertical"></div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default Maze;
