// src/App.js
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SetupPage from './Components/SetupPage';
import GameBoard from './Components/GameBoard';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameId] = useState(uuidv4());

  const handleStart = (name) => {
    setPlayerName(name);
  };

  return (
    <div className="App">
      {playerName ? (
        // Inline styling for the game-container
        <div className="game-container" >
          <GameBoard playerName={playerName} gameId={gameId}/>
        </div>
      ) : (
        <SetupPage onStart={handleStart} />
      )}
    </div>
  );
}

export default App;
