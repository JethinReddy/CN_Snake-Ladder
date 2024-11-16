// src/App.js
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SetupPage from './Components/SetupPage';
import GameBoard from './Components/GameBoard';
import VoiceChat from './Components/VoiceChat'; // Import the VoiceChat component

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameId] = useState(uuidv4());

  const handleStart = (name) => {
    setPlayerName(name);
  };

  return (
    <div className="App">
      {playerName ? (
        <div className="game-container" style={{ position: 'relative' }}>
          <GameBoard playerName={playerName} gameId={gameId} />
          
          {/* Adding VoiceChat component */}
          <div className="voice-chat-container" style={{ position: 'absolute', top: 0, right: 0 }}>
            <VoiceChat />
          </div>
        </div>
      ) : (
        <SetupPage onStart={handleStart} />
      )}
    </div>
  );
}

export default App;
