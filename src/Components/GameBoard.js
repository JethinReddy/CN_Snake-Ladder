// src/components/GameBoard.js
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import ChatBox from './ChatBox';

// Move socket initialization outside the component to prevent reinitialization
const socket = io('http://localhost:3000', { autoConnect: false }); // Initialize socket once with autoConnect: false

const PIECE_COLORS = ['red', 'blue', 'green', 'yellow'];
const ladders = { 2: 23, 4: 68, 6: 45, 20: 59, 30: 96, 52: 72, 57: 96, 71: 92 };
const snakes = { 98: 40, 84: 58, 87: 49, 73: 15, 56: 8, 50: 5, 43: 17 };

const GameBoard = ({ playerName, gameId }) => {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [diceRoll, setDiceRoll] = useState(1);
  const [turn, setTurn] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const boardSize = 600;
  const cellSize = boardSize / 10;
  const iconOffset = 10;

  // Connect the socket only once when the component mounts
  useEffect(() => {
    if (!socket.connected) {
      socket.connect(); // Connect the socket only once
      console.log('Socket connected');
    }

    // Join the game if currentPlayer is not set
    if (!currentPlayer) {
      const newPlayer = {
        name: playerName,
        pos: 1,
        color: PIECE_COLORS[players.length % PIECE_COLORS.length]
      };
      setCurrentPlayer(newPlayer);
      socket.emit('join', newPlayer);
    }

    // Event listeners
    socket.on('playerJoined', (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setIsGameStarted(updatedPlayers.length >= 2); // Enable roll button if >= 2 players
    });

    socket.on('gameStateUpdate', ({ players: updatedPlayers, diceValue, turn: newTurn }) => {
      setPlayers(updatedPlayers);
      setDiceRoll(diceValue);
      setTurn(newTurn);
      drawBoard();
    });

    socket.on('gameOver', (winner) => {
      alert(`${winner.name} has won the game!`);
    });

    socket.on('joinError', (message) => {
      alert(message); // Show an alert if the game is full or already started
      if (message.includes("started")) {
        setIsGameStarted(true); // Set the game as started if we receive a "started" message
      }
    });

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      console.log('Socket disconnected');
      socket.disconnect();
    };
  }, [playerName, currentPlayer, players.length]);

  const rollDice = () => {
    if (currentPlayer && players[turn]?.name === currentPlayer.name) {
      socket.emit('rollDice');
    } else {
      alert("It's not your turn!"); // Provide feedback for out-of-turn dice rolls
    }
  };

  // Draw board and player icons
  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const boardImage = new Image();
    boardImage.src = '/images/board.png';
    boardImage.onload = () => {
      ctx.clearRect(0, 0, boardSize, boardSize);
      ctx.drawImage(boardImage, 0, 0, boardSize, boardSize);

      const positionMap = {};

      players.forEach((player) => {
        const adjustedPos = player.pos - 1;
        const row = Math.floor(adjustedPos / 10);
        const col = adjustedPos % 10;
        const baseX = (row % 2 === 0 ? col : 9 - col) * cellSize + cellSize / 4;
        const baseY = boardSize - (row + 1) * cellSize + cellSize / 4;

        if (!positionMap[player.pos]) {
          positionMap[player.pos] = [];
        }
        const offsetIndex = positionMap[player.pos].length;
        positionMap[player.pos].push(player);

        const offsetX = (offsetIndex % 2) * iconOffset;
        const offsetY = Math.floor(offsetIndex / 2) * iconOffset;

        const img = new Image();
        img.src = `/images/${player.color}_piece.png`;
        img.onload = () => ctx.drawImage(img, baseX + offsetX, baseY + offsetY, cellSize / 2, cellSize / 2);
      });
    };
  };

  useEffect(() => {
    drawBoard(); // Initial board draw
  }, [players]);

  return (
    <div>
      <h2>Snake and Ladder Game</h2>
      <p>Current Turn: Player {players[turn]?.name || 'Unknown'}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '20px', width: '100%' }}>
        <div style={{ width: '70%' }}>
          <canvas ref={canvasRef} width={boardSize} height={boardSize} />
        </div>
        <div style={{ width: '25%', padding: '20px', borderRadius: '10px' }}>
          <button onClick={rollDice} disabled={!currentPlayer || players[turn]?.name !== currentPlayer?.name}>
            Roll Dice
          </button>
          <p>Dice Roll: {diceRoll}</p>
          <ul>
            {players.map((player, index) => (
              <li key={index} style={{ color: player.color }}>
                {player.name}: {player.pos}
              </li>
            ))}
          </ul>
          <ChatBox playerName={currentPlayer?.name || 'Unknown'} /> 
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
