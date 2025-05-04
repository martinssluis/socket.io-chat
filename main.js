import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname,join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuração CORRETA para arquivos estáticos
app.use('/static', express.static(join(__dirname, 'static'))); // Serve /static/css e /static/js

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '/templates/index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Envia mensagem de boas-vindas apenas para o novo usuário
  socket.emit('chat message', 'Welcome to socketio chat!');

  // Envia mensagem para todos os usuários, exceto o novo usuário
  socket.broadcast.emit('chat message', 'A new user has joined the chat');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);  
});

});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});