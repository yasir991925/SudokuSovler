import { useState, useRef, useCallback } from "react";
import solveSudoku from "./Solve";
import { ReactComponent as CameraIcon } from "./photo-camera.svg";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

import "./App.css";

const WebcamCapture = ({ toggle }) => {
  const webcamRef = useRef(null);
  const videoConstraints = {
    width: 300,
    height: 300,
    // facingMode: { exact: "environment" },
    facingMode: "user",
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    toggle(imageSrc);
  }, [webcamRef, toggle]);

  return (
    <div className="webcam-container">
      <Webcam
        audio={false}
        height={300}
        width={300}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
      <button onClick={capture}>Capture photo</button>
    </div>
  );
};

const initial_board = Array.from(Array(9), () => new Array(9).fill(0));

const pre = [
  [3, 0, 6, 5, 0, 8, 4, 0, 0],
  [5, 2, 0, 0, 0, 0, 0, 0, 0],
  [0, 8, 7, 0, 0, 0, 0, 3, 1],
  [0, 0, 3, 0, 1, 0, 0, 8, 0],
  [9, 0, 0, 8, 6, 3, 0, 0, 5],
  [0, 5, 0, 0, 9, 0, 6, 0, 0],
  [1, 3, 0, 0, 0, 0, 2, 5, 0],
  [0, 0, 0, 0, 0, 0, 0, 7, 4],
  [0, 0, 5, 2, 0, 6, 3, 0, 0],
];

const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay));

// ----------------
// ---- JSX -------
// ----------------

function App() {
  const [board, updateBoard] = useState(pre);
  const [status, setStatus] = useState(null);
  const [solving, setSolving] = useState(false);
  const [webcam, setWebcam] = useState(false);

  const getNewBoard = () => {
    updateBoard(pre);
    setStatus(null);
  };

  const resetBoard = () => {
    updateBoard(pre);
    setStatus(null);
    setSolving(false);
  };

  const updateCell = async (i, j, val) => {
    const new_board = [...board];
    new_board[i][j] = val;
    updateBoard(new_board);
    await wait(10);
  };

  const renderBoard = () => {
    return board.map((row, j) => (
      <div key={j} className="row">
        {row.map((cell, i) => (
          <Cell key={(i + 1) * (j + 1)} value={cell} i={i} j={j} dyc={cell === 0} />
        ))}
      </div>
    ));
  };

  const solve = async () => {
    if (solving) {
      resetBoard();
      return;
    }
    setSolving(true);
    const ans = await solveSudoku(board, updateCell);
    if (ans) {
      setStatus("SOLVED");
    } else {
      setStatus("IMPOSSIBLE TO SOLVE");
    }
    setSolving(false);
  };

  const takePhoto = (imageSrc) => {
    setWebcam(!webcam);
    if (typeof imageSrc === "string") {
      Tesseract.recognize(imageSrc, "eng", { logger: (m) => console.log(m) }).then(
        ({ data: { text } }) => {
          console.log(text);
        }
      );
    }
  };

  return (
    <div className="App">
      <div>
        <h1 className="dark">Sudoku Solver</h1>
        <div className="board">{renderBoard()}</div>

        <div className="container">
          {!solving ? <button onClick={getNewBoard}>Reset Puzzle</button> : null}
          <button onClick={solve}>{solving ? "Stop" : "Solve"}</button>
          <button className="icon-button" onClick={takePhoto}>
            <CameraIcon />
          </button>
        </div>

        {webcam ? <WebcamCapture toggle={takePhoto} /> : null}
        {status ? <h1>{status}</h1> : null}
      </div>
    </div>
  );
}

function Cell({ value, i, j, dyc }) {
  i += 1;
  j += 1;
  let dyc_class = dyc ? " dyc" : "";
  let left_b = i < 8 && i % 3 === 0 ? " left_b" : "";
  let bottom_b = j < 8 && j % 3 === 0 ? " bottom_b" : "";
  let glow = value === 0 ? " glow" : "";
  return <div className={"cell" + glow + bottom_b + left_b + dyc_class}>{value}</div>;
}

export default App;
