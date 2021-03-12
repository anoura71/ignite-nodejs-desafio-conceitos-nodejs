const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


/** Middleware: Verificar se o username já está cadastrado. */
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user =>
    user.username === username,
  );
  if (!user) {
    return response.status(404).json({ error: 'Username does not exist!' });
  }

  request.user = user;

  return next();
}


/** Cadastrar novo usuário. */
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  // Verifica se o username já está cadastrado
  const usernameAlreadyExists = users.some(user =>
    user.username === username,
  );
  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists!' });
  }

  // Cadastra o novo usuário
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);

  return response.status(201).json(newUser);
});


/** Listar todas as tarefas de um usuário. */
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});


/** Criar uma nova tarefa. */
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  // Cria o objeto da tarefa
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  // Inclui a tarefa na lista de tarefas do usuário
  user.todos.push(todo);

  return response.status(201).json(todo);
});


/** Atualizar uma tarefa. */
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  // Procura a tarefa com o id informado como parâmetro
  const todo = user.todos.find(todo =>
    todo.id === id,
  );
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  // Atualiza os campos com os valores informados
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});


/** Marcar uma tarefa como 'feita'. */
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  // Procura a tarefa com o id informado como parâmetro
  const todo = user.todos.find(todo =>
    todo.id === id,
  );
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  // Atualiza os campos com os valores informados
  todo.done = true;

  return response.json(todo);
});


/** Excluir uma tarefa. */
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  // Procura a tarefa com o id informado como parâmetro
  const todo = user.todos.find(todo =>
    todo.id === id,
  );
  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' });
  }

  // Exclui a tarefa da lista de tarefas do usuário
  user.todos.splice(todo, 1);

  return response.status(204).json();
});


module.exports = app;