# Inicialização do projeto

O primeiro passo é criar uma simples página HTML que exiba o formulário e uma lista de mensagens. 

Usaremos o framework web Node.JS express para isso. Certifique-se que o *Node.JS* está instalado.

## Criando o package.json

Primeiro, vamos criar um package.json que descreve nosso projeto:

```json
{
  "name": "socket-chat",
  "version": "0.0.1",
  "description": "my first socket.io app",
  "type": "module",
  "dependencies": {}
}
```
💡 Recomenda-se colocar em um diretório vazio dedicado (socket-chat)

⚠️ Atenção: A propriedade "name" deve ser única. Você não pode usar um valor como "socket.io" ou "express", porque o npm reclamará ao instalar a dependência.

## Depois de instalado, podemos criar um index.js que configurará nosso aplicativo
```
import express from 'express';
import { createServer } from 'node:http';

const app = express()
const server = createServer(app);

app.get('/', (req), res)=>{
	res.send('<h1>Hellow World!</h1>');
	});

server.listen(3000, ()=>{
	console.log('server runing at http://localhost:3000');
	});
```
Isso significa que o Express é iniciado para ser um manipulador de funções que você pode fornecer a um servidor HTTP

Definimos um manipulador de rotas ‘/’ que é chamado quando acessamos a página inicial do nosso projeto

Fizemos o servidor http rodar na porta 3000

Se executar o node index,js deverá aparecer o seguinte:
![alt text]({9B24DF34-EA6E-4190-9002-40AC67847DCB}.png)

E se acessar http://localhost:3000: no navegador teremos :

![alt text]({57AA3B78-534B-49A8-818F-642B059738AE}.png)

## Gerenciando dependências e arquivos ignorados

Ao executar npm install, o NPM cria a pasta node_modules com todas as dependências. Por boas práticas:

### O que você deve fazer:

**Crie um arquivo `.gitignore`** na raiz do projeto com:
   ```gitignore
  # Dependências
node_modules/

# Ambiente
.env
.env.local

# Logs e temporários
*.log
npm-debug.log*
.DS_Store

# IDEs/Editores
.idea/
.vscode/
*.swp

# Sistema operacional
Thumbs.db
```
## Servindo o HTML

Até agora, no index.js estamos chamando res.send e passando uma string HTML. Nosso código ficará muito confuso se simplesmente colocássemos o HTML inteiro do aplicativo ali, então, vamos criar um index.html e servi-lo

Vamos refatorar nosso manipulador de rotas para usar sendFile em vez disso

```jsx
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const app = express();
const server = createServer(app);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '/templates/index.html'));
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

Agora, devemos criar dois diretórios na raiz do nosso projeto static e template

- Dentro do diretório static, criaremos outros dois diretórios
    - js - para guardarmos arquivos .js
    - css - para guardarmos arquivos css
    
    Cada arquivo deve conter o nome de referência do html, como estamos trabalhando no index, nossos arquivos agora terão o prefixo index
    
- Dentro do diretório templates, guardaremos os arquivos html da nossa aplicação

Vamos criar nosso arquivo index.html dentro do diretório templates, e nele teremos o seguinte esqueleto do site:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Socket.IO chat</title>
    <link rel="stylesheet" href="/static/css/index.css"> <!--link para o css-->
</head>
<body>
    <ul id="messages"></ul>
    <form id="form" action="">
        <input id="input" autocomplete="off" /><button>Send</button>
    </form>
</body>
</html>
```

Dentro do nosso diretório Css, localizado em static, vamos criar o arquivo index.css:
```css
body {
    margin: 0;
    padding-bottom: 3rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#form {
    background: rgba(0, 0, 0, 0.15);
    padding: 0.25rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    height: 3rem;
    box-sizing: border-box;
    backdrop-filter: blur(10px);
}

#input {
    border: none;
    padding: 0 1rem;
    flex-grow: 1;
    border-radius: 2rem;
    margin: 0.25rem;
}

#input:focus {
    outline: none;
}

#form>button {
    background: #333;
    border: none;
    padding: 0 1rem;
    margin: 0.25rem;
    border-radius: 3px;
    outline: none;
    color: #fff;
}

#messages {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

#messages>li {
    padding: 0.5rem 1rem;
}

#messages>li:nth-child(odd) {
    background: #efefef;
}

```
Ao rodar novamente o projeto através do index.js, teremos a página atualizada, apresentando um campo de input e um botão. Caso sua aplicação não esteja da mesma forma, favor revisar o código

## Integrando o Socket.IO

O [socket.io](http://socket.io) é composto de duas partes :

- Um servidor que se integra com servidor HTTP Node.JS
- Uma biblioteca cliente que carrega no lado do navegador

Vamos instalar um módulo apenas por enquanto

```css
npm install socket.io
```

Isso instalará o módulo e adicionará a dependência ao package.json. Agora vamos editar o index.js para adiciona-lo

```jsx
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname,join } from 'node:path';
import { Server } from 'socket.io'; //new

const app = express();
const server = createServer(app);
const io = new Server(server); //new

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '/templates/index.html'));
});

io.on('connection', (socket) => { //new
    console.log('a user connected');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

Observe que uma nova intância de [socket.io](http://socket.io) passando o server. Em seguida, executo o evento connection em busca de sockets de entrada e registro no console

Agora em index.html adicione o seguinte snippet antes do body

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

Observe que não estou especificando nenhuma URl quando chamo io(), pois o padrão é tentar se conectar ao host que serve a página

Agora, ao executar novamente o index.js, “a user connected” será exibida no terminal 

Cada soquete também dispara um `disconnect`evento especial:

```jsx
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname,join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '/templates/index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```

Ao atualizar a página várias vezes, podemos ver que no output, a mensagem de usuário desconectado será exibida, após isso, será conectado novamente

## ♻️ **Reestruturação de Arquivos para Boas Práticas**

Para atender boas práticas de organização e clareza no projeto, foram realizadas as seguintes alterações:

- O arquivo originalmente chamado `index.js` (localizado na raiz do projeto) foi renomeado para `main.js`. Essa mudança visa deixar claro que se trata do arquivo principal de execução do servidor.

- Foi criado um novo arquivo `index.js`, agora localizado em um diretório apropriado (como `static/js/`), exclusivamente para a lógica da página `index.html`.

- Os scripts que estavam embutidos no `index.html` foram removidos e movidos para esse novo `index.js`, centralizando e organizando melhor o código JavaScript da interface.

Essas mudanças tornam a estrutura do projeto mais compreensível e alinhada com boas práticas de desenvolvimento web.

## ## Emitindo eventos

A ideia principal por trás do [socket.io](http://socket.io) é que você pode enviar e receber quaisquer eventos que desejar, com quaisquer dados que desejar. Qualquer objeto que possa ser codificado como JSON serve, e dados binários também são suportados.

Vamos fazer com que, quando o usuário digitar uma mensagem, o servidor receba como um evento  chat message. 

Nosso index.js agora ficará assim:

```jsx
const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});
```

Nosso main.js ficara assim:

``` 
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname,join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuração CORRETA para arquivos estáticos
app.use('/static', express.static(join(__dirname, 'static'))); // Serve /static/css e /static/js

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '/templates/index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);  
});

});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
```
*_Outras alterações e correções poderão ser vistos através dos commits do projeto_*

## Transmição
## Transmissão

O próximo objetivo é emitir o evento do servidor para o resto dos usuários

Para enviar um evento para todos, o [Socket.io](http://Socket.io) nos fornece o io.emit()

```jsx
// this will emit the event to all connected sockets
io.emit('hello', 'world');
```

Se você quiser enviar uma mensagem para todos, exceto para um determinado socket anterior, temos o broadcast  para emissão desse socket

```jsx
io.on('conecton', (socket) => {
	socket.broadcast.emit('hi');
	});
```

Os arquivos ficaram assim :
```jsx
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname,join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

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
```
```jsx
const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', (msg) => {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}
);
```
*_O style da página foi alteraado para melhor visualização_*

## Lidando com desconexões

Agora vamos destacar duas propriedades importantes do Socket.io:

1. Um cliente nem sempre está conectado
2. Um servidor não armazena nenhum evento

🚨
Mesmo em uma rede estável, não é possível manter uma conexão ativa para sempre.
O que significa que a aplicação precisa ser capaz de sincronizar o estado local do cliente com o estado global no servidor após uma desconexão temporária
O cliente tentará se reconectar automaticamente após um pequeno atraso. No entanto, qualquer evento perdido durante o período de desconexão será efetivamente perdido para este cliente

## Recuperação do estado de conexão
Agora vamos destacar duas propriedades importantes do Socket.io:

1. Um cliente nem sempre está conectado
2. Um servidor não armazena nenhum evento

Mesmo em uma rede estável, não é possível manter uma conexão ativa para sempre.

O que significa que a aplicação precisa ser capaz de sincronizar o estado local do cliente com o estado global no servidor após uma desconexão temporária
O cliente tentará se reconectar automaticamente após um pequeno atraso. No entanto, qualquer evento perdido durante o período de desconexão será efetivamente perdido para este cliente


## Recuperação do estado de conexão

Primeiro vamos lidar com desconexões fingindo que não houve desconexão: esse recurso é chamado de “Recuperação do estado de conexão”

Este recurso  armazenará temporariamente todos os eventos enviados pelo servidor e tentará restaurar o estado de um cliente quando ele se reconectar:

- Restaurar seus os “rooms”
- Envia quaisquer eventos perdisos

Deve ser habilitado no lado do servidor (main.js):

```jsx
const io = new Server(server, {
  connectionStateRecovery: {}
});
```

Alteração no index.html:

```jsx
<form id="form" action="">
  <input id="input" autocomplete="off" /><button>Send</button>
  <button id="toggle-btn">Disconnect</button>
</form>
```

Alteração no index.js:

```jsx
const toggleButton = document.getElementById('toggle-btn');

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
```

Esse recurso é muito útil, porque ele não é implementado por padrão ?

- Nem sempre funciona, por exemplo, se o servidor travar abruptamente ou for reiniciado, o estado do cliente não pode ser salvo
- Nem sempre é possível habilitar esse recurso ao aumentar a escala

Dito isso, é realmente um ótimo recurso, pois você não precisa sincronizar o estado do cliente após uma desconexão temporária (mudar wifi para 4g)