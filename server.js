const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {};
let currentColor = null;
let gameInProgress = false;

app.use(express.static('public'));

function generateRandomColor() {
  const colors = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function startRound() {
  currentColor = generateRandomColor();
  gameInProgress = true;
  io.emit('new-round', currentColor);
}

io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);

  socket.on('player-name', name => {
    players[socket.id] = { name, score: 0 };
    socket.emit('score-update', players);
    io.emit('score-update', players);

    if (!gameInProgress) {
      startRound();
    }
  });

  socket.on('submit-color', (color) => {
    if (gameInProgress && color === currentColor) {
      players[socket.id].score += 1;
      gameInProgress = false;
      const winnerName = players[socket.id].name;
      io.emit('round-winner', { winnerName, color });
      io.emit('score-update', players);
      setTimeout(startRound, 2000);
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('score-update', players);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
