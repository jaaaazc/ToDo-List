import express from "express";
import cors from "cors";
import { createClient } from "redis";
import { randomUUID } from "crypto";
import os from "os";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ?? 4000;
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const TODOS_KEY = "todos";

const redisClient = createClient({ url: REDIS_URL });
redisClient.on("error", (err) => console.error("Redis error:", err));

// Identificadores únicos de esta ejecución del contenedor
let runNumber = 0;
const instanceId = randomUUID();
const startedAt = new Date().toISOString();

async function registerRun() {
  runNumber = await redisClient.incr("app:run_counter");
}

async function getTodos() {
  const data = await redisClient.get(TODOS_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveTodos(todos: any[]) {
  await redisClient.set(TODOS_KEY, JSON.stringify(todos));
}

app.get("/api/info", (req, res) => {
  res.json({
    runNumber,
    instanceId,
    hostname: os.hostname(),
    startedAt,
  });
});

app.get("/api/todos", async (req, res) => {
  const todos = await getTodos();
  res.json(todos);
});

app.post("/api/todos", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title es requerido" });
  }
  const todos = await getTodos();
  const newTodo = { id: randomUUID(), title, completed: false };
  todos.push(newTodo);
  await saveTodos(todos);
  res.status(201).json(newTodo);
});

app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const todos = await getTodos();
  const todo = todos.find((t: any) => t.id === id);
  if (!todo) {
    return res.status(404).json({ error: "No encontrado" });
  }
  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;
  await saveTodos(todos);
  res.json(todo);
});

app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const todos = await getTodos();
  const filtered = todos.filter((t: any) => t.id !== id);
  await saveTodos(filtered);
  res.status(204).send();
});

async function start() {
  await redisClient.connect();
  await registerRun();
  app.listen(PORT, () => {
    console.log(
      `Backend corriendo en puerto ${PORT} — Run #${runNumber} — Instance ${instanceId}`
    );
  });
}

start();