import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "../App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type AuthMode = "login" | "signup";

export function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const authMutation = useMutation({
    mutationFn: async () => {
      if (mode === "login") {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
          email,
          password,
        });
        return response.data;
      } else {
        const response = await axios.post(`${API_URL}/api/auth/signup`, {
          email,
          password,
          full_name: fullName,
          org_name: orgName,
        });
        return response.data;
      }
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setEmail("");
      setPassword("");
      setFullName("");
      setOrgName("");
    },
    onError: (error: any) => {
      alert("Error: " + (error.response?.data?.error || error.message));
    },
  });

  if (token) {
    return (
      <div className="app">
        <div className="container">
          <header>
            <h1>✅ Autenticado</h1>
            <p>Token: {token.slice(0, 20)}...</p>
          </header>
          <main style={{ padding: "20px" }}>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setToken("");
              }}
              style={{ padding: "10px 20px", fontSize: "16px" }}
            >
              Logout
            </button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>🏗️ ERP OS Auth</h1>
          <p>{mode === "login" ? "Inicia sesión" : "Regístrate"}</p>
        </header>

        <main style={{ padding: "20px" }}>
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div style={{ marginBottom: "15px" }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={{ width: "100%", padding: "10px", marginTop: "5px" }}
              />
            </div>

            {mode === "signup" && (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre"
                    style={{ width: "100%", padding: "10px", marginTop: "5px" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>Nombre de Organización</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Mi empresa"
                    style={{ width: "100%", padding: "10px", marginTop: "5px" }}
                  />
                </div>
              </>
            )}

            <button
              onClick={() => authMutation.mutate()}
              disabled={authMutation.isPending}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {authMutation.isPending
                ? "Procesando..."
                : mode === "login"
                  ? "Iniciar Sesión"
                  : "Registrarse"}
            </button>

            <p style={{ textAlign: "center", marginTop: "15px" }}>
              {mode === "login" ? "¿No tienes cuenta? " : "¿Tienes cuenta? "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
