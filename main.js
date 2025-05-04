import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname,join } from 'node:path';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

// Abre o banco e cria a tabela
const db = await open({
  filename: 'chat.db',
  driver: sqlite3.Database
});

await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
  );
`);

// Configuração CORRETA para arquivos estáticos
app.use('/static', express.static(join(__dirname, 'static'))); // Serve /static/css e /static/js

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '/templates/index.html'));
});

io.on('connection',async (socket) => {
  console.log('a user connected');

// Envia mensagem de boas-vindas apenas para o novo usuário
  socket.emit('chat message', 'Welcome to socketio chat!');

// Envia mensagem para todos os usuários, exceto o novo usuário
  socket.broadcast.emit('chat message', 'A new user has joined the chat');

socket.on('chat message', async (msg) => {
  let result;
  try {
    result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
  } catch (e) {
    console.error('Failed to store message:', e);
    return;
  }
  io.emit('chat message', msg, result.lastID);
  });

  if (!socket.recovered) {
    try {
      await db.each(
        'SELECT id, content FROM messages WHERE id > ?',
        [socket.handshake.auth.serverOffset || 0],
        (_err, row) => {
          socket.emit('chat message', row.content, row.id);
        }
      );
    } catch (e) {
      console.error('Recovery failed:', e);
    }
  }

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});