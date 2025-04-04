const socket = io();

let playerName = '';

function submitName() {
  const input = document.getElementById('nameInput');
  playerName = input.value.trim();
  if (playerName) {
    socket.emit('player-name', playerName);
    document.getElementById('namePrompt').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
  }
}

const promptEl = document.getElementById('prompt');
const buttonsEl = document.getElementById('buttons');
const scoreboardEl = document.getElementById('scoreboard');

const allColors = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple'];

socket.on('new-round', (color) => {
  promptEl.textContent = `🎯 Find the color: ${color}`;
  buttonsEl.innerHTML = '';

  const options = [...allColors].sort(() => 0.5 - Math.random()).slice(0, 4);
  if (!options.includes(color)) options[Math.floor(Math.random() * 4)] = color;

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.style.backgroundColor = opt.toLowerCase();
    btn.onclick = () => socket.emit('submit-color', opt);
    buttonsEl.appendChild(btn);
  });
});

socket.on('round-winner', ({ winnerName, color }) => {
  promptEl.textContent = `🎉 ${winnerName} found "${color}" first!`;
});

socket.on('score-update', (players) => {
  scoreboardEl.innerHTML = '';
  for (let id in players) {
    const { name, score } = players[id];
    const li = document.createElement('li');
    li.textContent = `${name}: ${score}`;
    scoreboardEl.appendChild(li);
  }
});
