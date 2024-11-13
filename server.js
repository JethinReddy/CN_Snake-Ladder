// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001", // Update with frontend port if different
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;
const MAX_PLAYERS = 4;
const MIN_PLAYERS = 2;
const PIECE_COLORS = ['red', 'blue', 'green', 'yellow'];

let players = [];
let turn = 0;
let gameStarted = false; // Track if the game has started

io.on('connection', (socket) => {
  console.log('A new client connected.');
 
      socket.on('chatMessage', (message) => {
        io.emit('chatMessage', message); // Broadcast message to all players
      });
    
      // Other game-related events here...


  socket.on('join', (playerData) => {
    if (gameStarted) {
      // Reject new players if the game has already started
      socket.emit('joinError', 'The game has already started. No new players can join.');
      console.log(`Player ${playerData.name} was denied entry - game already started.`);
      return;
    }

    if (players.length >= MAX_PLAYERS) {
      socket.emit('joinError', 'The game is full. Maximum 4 players allowed.');
      console.log(`Player ${playerData.name} was denied entry - game is full.`);
      return;
    }

    if (!players.some(player => player.name === playerData.name)) {
      playerData.id = players.length;
      playerData.pos = 1;
      playerData.color = PIECE_COLORS[players.length % PIECE_COLORS.length];
      players.push(playerData);

      console.log(`Player joined: ${playerData.name}`);
      io.emit('playerJoined', players);
    }
  });
  

  socket.on('rollDice', () => {
    if (players.length < MIN_PLAYERS) {
      socket.emit('gameError', 'At least 2 players are required to start the game.');
      console.log('Attempted roll with less than 2 players.');
      return;
    }

    if (!gameStarted) {
      gameStarted = true; // Lock the game after the first roll
      console.log('Game has started.');
    }

    const currentPlayer = players[turn];
    const roll = Math.ceil(Math.random() * 6);
    let newPos = currentPlayer.pos + roll;

    const ladders = { 2: 23, 4: 68, 6: 45, 20: 59, 30: 96, 52: 72, 57: 96, 71: 92 };
    const snakes = { 98: 40, 84: 58, 87: 49, 73: 15, 56: 8, 50: 5, 43: 17 };

    if (newPos >= 99) {
      newPos = 99;
      io.emit('gameOver', currentPlayer);
    } else if (ladders[newPos]) {
      newPos = ladders[newPos];
    } else if (snakes[newPos]) {
      newPos = snakes[newPos];
    }

    players[turn].pos = newPos;
    console.log(`${currentPlayer.name} rolled a ${roll} and moved to ${newPos}`);

    turn = (turn + 1) % players.length;

    io.emit('gameStateUpdate', { players, diceValue: roll, turn });
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
    players = players.filter(player => player.id !== socket.id);
    io.emit('playerJoined', players);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
