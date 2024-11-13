// src/components/SetupPage.js
import React, { useState } from 'react';

function SetupPage({ onStart }) {
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      onStart(name.trim());
    } else {
      alert("Please enter a name to start the game.");
    }
  };

  return (
    <div className="setup-page">
      <h2>Welcome to Snake and Ladder!</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={handleStart}>Join Game</button>
    </div>
  );
}

export default SetupPage;
