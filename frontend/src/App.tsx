import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  created_at: string;
}

export function App() {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const orgId = "test-org-id";
  const userId = "test-user-id";

  const askMutation = useMutation({
    mutationFn: async (msg: string) => {
      const response = await axios.post(`${API_URL}/api/architect/ask`, {
        org_id: orgId,
        user_id: userId,
        conversation_id: conversationId || undefined,
        message: msg,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        { id: "user-" + Date.now(), role: "user", content: message, created_at: new Date().toISOString() },
        { ...data.message, role: "assistant" },
      ]);
      setMessage("");
    },
    onError: (error: any) => {
      alert("Error: " + (error.response?.data?.error || error.message));
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      askMutation.mutate(message);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>🏗️ The Architect</h1>
          <p>ERP OS Companion</p>
        </header>

        <main>
          <div className="chat-area">
            {messages.length === 0 ? (
              <div className="welcome">
                <h2>Bienvenido</h2>
                <p>Comienza a conversar con The Architect</p>
                <div className="suggestions">
                  <button onClick={() => setMessage("¿Cómo puedo gestionar mi inventario?")}>
                    Gestión de inventario
                  </button>
                  <button onClick={() => setMessage("Necesito organizar mi CRM")}>
                    Organizar CRM
                  </button>
                  <button onClick={() => setMessage("¿Cómo automatizo mis flujos?")}>
                    Automatizar flujos
                  </button>
                </div>
              </div>
            ) : (
              <div className="messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.role}`}>
                    <div className="message-content">
                      <p>{msg.content}</p>
                      {msg.provider && <span className="provider">{msg.provider}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <footer className="input-area">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe tu mensaje..."
              disabled={askMutation.isPending}
            />
            <button onClick={handleSend} disabled={askMutation.isPending || !message.trim()}>
              {askMutation.isPending ? "Enviando..." : "Enviar"}
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
