import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Obter o caminho do diretório atual (para servir arquivos estáticos)
const __dirname = dirname(fileURLToPath(import.meta.url));

// Verifica se é o processo primário (gerenciador) ou um worker
if (cluster.isPrimary) {
  console.log(`Processo primário ${process.pid} está rodando`);
  
  // Determina quantos workers criar (um por núcleo de CPU)
  const numCPUs = availableParallelism();
  
  // Cria um worker para cada núcleo de CPU
  for (let i = 0; i < numCPUs; i++) {
    // Cada worker roda em uma porta diferente (3000, 3001, 3002...)
    cluster.fork({
      PORT: 3000 + i
    });
  }
  
  // Configura o adapter no processo primário para gerenciar comunicação entre workers
  setupPrimary();
  
  // Eventos para monitorar workers
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} morreu. Reiniciando...`);
    cluster.fork();
  });
} else {
  // CÓDIGO DOS WORKERS (processos filhos)
  
  // Configuração do Express
  const app = express();
  const port = process.env.PORT; // Porta atribuída pelo processo primário
  const server = createServer(app);
  
  // Configuração do Socket.IO com recovery e cluster adapter
  const io = new Server(server, {
    connectionStateRecovery: {},
    adapter: createAdapter() // Permite comunicação entre workers
  });

  // Configuração do banco de dados SQLite
  const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
  });

  // Cria tabela de mensagens se não existir
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
    );
  `);

  // Servir arquivos estáticos
  app.use('/static', express.static(join(__dirname, 'static')));

  // Rota principal
  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '/templates/index.html'));
  });

  // Eventos do Socket.IO
  io.on('connection', async (socket) => {
    console.log(`Novo cliente conectado no worker ${process.pid} (porta ${port})`);
    
    // Mensagem de boas-vindas apenas para o novo usuário
    socket.emit('chat message', `Bem-vindo ao chat! (Worker ${process.pid})`);
    
    // Notifica outros usuários sobre a nova conexão
    socket.broadcast.emit('chat message', `Novo usuário conectado no worker ${process.pid}`);

    // Recebimento de novas mensagens
    socket.on('chat message', async (msg, clientOffset, callback) => {
      try {
        // Insere mensagem no banco de dados
        const result = await db.run(
          'INSERT INTO messages (content, client_offset) VALUES (?, ?)',
          msg, clientOffset
        );
        
        // Replica a mensagem para TODOS os clients em TODOS os workers
        io.emit('chat message', msg, result.lastID);
        callback();
      } catch (e) {
        if (e.errno === 19) { // SQLITE_CONSTRAINT (mensagem duplicada)
          callback(); // Confirma recebimento
        }
        // Outros erros: cliente tentará novamente
      }
    });

    // Recuperação de mensagens perdidas durante reconexão
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
        console.error('Falha na recuperação:', e);
      }
    }

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado do worker ${process.pid}`);
    });
  });

  // Inicia o servidor na porta específica deste worker
  server.listen(port, () => {
    console.log(`Worker ${process.pid} rodando em http://localhost:${port}`);
  });
}