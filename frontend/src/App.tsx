import { useState, useEffect } from "react";
import "./App.css";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface AppInfo {
  runNumber: number;
  instanceId: string;
  hostname: string;
  startedAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = `${API_BASE}/api/todos`;
const INFO_URL = `${API_BASE}/api/info`;

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<AppInfo | null>(null);

  async function loadTodos() {
    setLoading(true);
    const res = await fetch(API_URL);
    const data = await res.json();
    setTodos(data);
    setLoading(false);
  }

  useEffect(() => {
    loadTodos();
    fetch(INFO_URL)
      .then((res) => res.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    setNewTitle("");
    loadTodos();
  }

  async function handleToggle(todo: Todo) {
    await fetch(`${API_URL}/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    loadTodos();
  }

  async function handleDelete(id: string) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadTodos();
  }

  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #fff0f5 0%, #ffdcea 100%)",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "64px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 24,
          padding: "48px 44px",
          boxShadow: "0 20px 50px rgba(219, 39, 119, 0.12)",
          position: "relative",
        }}
      >
        {info && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "#fce7f3",
              color: "#be185d",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
            }}
            title={`Instancia: ${info.instanceId} — Host: ${info.hostname}`}
          >
            Run #{info.runNumber} · {info.instanceId.slice(0, 8)}
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: 56, width: "100%" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌸</div>
          <h1
            style={{
              color: "#be185d",
              fontSize: 30,
              fontWeight: 700,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            To-Do List
          </h1>
          {total > 0 && (
            <p style={{ color: "#db2777", opacity: 0.7, marginTop: 10, fontSize: 14 }}>
              {done} de {total} tareas completadas
            </p>
          )}
        </div>

        <form
          onSubmit={handleAdd}
          style={{ display: "flex", gap: 12, marginBottom: 36 }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="¿Qué tenés que hacer hoy?"
            style={{
              flex: 1,
              padding: "16px 20px",
              borderRadius: 14,
              border: "2px solid #fce7f3",
              outline: "none",
              fontSize: 15,
              background: "#ffffff",
              color: "#000000",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#f472b6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#fce7f3")}
          />
          <button
            type="submit"
            style={{
              padding: "16px 28px",
              borderRadius: 14,
              border: "none",
              background: "#ec4899",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(236, 72, 153, 0.35)",
              transition: "transform 0.15s, background 0.15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Agregar
          </button>
        </form>

        {loading ? (
          <p style={{ color: "#db2777", textAlign: "center", padding: "40px 0" }}>
            Cargando...
          </p>
        ) : todos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>🎀</div>
            <p style={{ color: "#db2777", opacity: 0.6, fontSize: 15 }}>
              No hay tareas todavía. ¡Agregá la primera!
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  marginBottom: 14,
                  borderRadius: 16,
                  background: todo.completed ? "#fdf2f8" : "#fff",
                  border: `2px solid ${todo.completed ? "#fbcfe8" : "#f9a8d4"}`,
                  transition: "background 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo)}
                  style={{
                    accentColor: "#ec4899",
                    width: 22,
                    height: 22,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    color: "#831843",
                    fontSize: 15.5,
                    lineHeight: 1.4,
                    textDecoration: todo.completed ? "line-through" : "none",
                    opacity: todo.completed ? 0.45 : 1,
                    wordBreak: "break-word",
                  }}
                >
                  {todo.title}
                </span>
                <button
                  onClick={() => handleDelete(todo.id)}
                  style={{
                    background: "transparent",
                    border: "1.5px solid #f9a8d4",
                    color: "#db2777",
                    borderRadius: 10,
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fce7f3")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;