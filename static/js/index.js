let counter = 0;
const socket = io({
  auth: {
    serverOffset: 0
  },
  // habilita reconexão automática (retries)
  ackTimeout: 10000,
  retries: 3,
});

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const toggleButton = document.getElementById('toggle-btn');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    // calcula um deslocamento único para cada mensagem
    const clientOffset = `${socket.id}-${counter++}`;
    socket.emit('chat message', input.value, clientOffset, () => {
  input.value = '';
});
  }
});

socket.on('chat message', (msg, serverOffset) => {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
  socket.auth.serverOffset = serverOffset;
}
);

toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (socket.connected) {
      toggleButton.innerText = 'Connect';
      socket.disconnect();
    } else {
      toggleButton.innerText = 'Disconnect';
      socket.connect();
    }
  });
