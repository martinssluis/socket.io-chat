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