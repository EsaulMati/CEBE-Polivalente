import React, { useState } from "react";
import logo from "../assets/logo.jpeg";
import { LogIn, Key, User, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { GOOGLE_SHEETS_API_URL, IS_DEMO_MODE } from "../config";

const normalizeAppsScriptUrl = (url) => {
  if (!url) return "";
  let normalized = url.trim();
  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  if (!normalized.endsWith("/exec")) {
    normalized = `${normalized}/exec`;
  }
  return normalized;
};

const isPlaceholderUrl = (url) => {
  return !url || url.includes("TU_URL_DEL_APPS_SCRIPT_AQUI");
};

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar que los campos no estén vacíos
    if (!username.trim()) {
      setError("Por favor ingresa el usuario.");
      return;
    }
    if (!password) {
      setError("Por favor ingresa la contraseña.");
      return;
    }

    setIsLoading(true);

    // Modo demo: usa solo credenciales locales
    if (IS_DEMO_MODE) {
      setTimeout(() => {
        if (username.trim() === "admin" && password === "admin123") {
          onLoginSuccess();
        } else {
          setError("Usuario: admin | Contraseña: admin123");
          setIsLoading(false);
        }
      }, 800);
      return;
    }

    const appsScriptUrl = normalizeAppsScriptUrl(GOOGLE_SHEETS_API_URL);

    if (
      isPlaceholderUrl(GOOGLE_SHEETS_API_URL) ||
      !appsScriptUrl.startsWith("https://script.google.com/macros/s/")
    ) {
      setError(
        "La URL de Google Apps Script no está configurada correctamente en src/config.js. Debe ser la URL de tu deployment y terminar en /exec.",
      );
      setIsLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "login",
          data: { username: username.trim(), password },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem("cebe_user", result.user);
        sessionStorage.setItem("cebe_token", result.token || "");
        onLoginSuccess();
      } else {
        setError(result.message || "Usuario o contraseña incorrectos.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error en login:", err.message);

      if (err.name === "AbortError") {
        setError("Timeout: el servidor tardó demasiado. Verifica tu conexión.");
      } else {
        setError(
          "Error de conexión con Google Sheets. Verifica que: 1) La URL esté correcta, 2) Google Apps Script esté deployado, 3) Google Sheets sea accesible.",
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden transition-colors duration-500">
      {/* Círculos decorativos de fondo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-school-100 dark:bg-school-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold-100 dark:bg-gold-900/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-school-200/30 dark:bg-school-800/10 rounded-full filter blur-3xl opacity-50"></div>

      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 p-8 rounded-2xl shadow-premium dark:shadow-2xl relative z-10 transition-colors duration-300">
        <div className="flex flex-col items-center">
          {/* Logo del colegio */}
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-school-200 dark:border-school-700 shadow-md mb-4 flex items-center justify-center bg-white dark:bg-slate-800 transition-colors duration-300">
            <img
              src={logo}
              alt="Logo CEBE Polivalente"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML =
                  '<span class="text-school-600 dark:text-school-400 font-bold text-3xl">CEBE</span>';
              }}
            />
          </div>
          <h2 className="text-3xl font-extrabold text-school-700 dark:text-school-400 tracking-tight text-center transition-colors duration-300">
            CEBE Polivalente
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">
            Sistema de Inventario Escolar
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm animate-shake transition-colors duration-300">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 transition-colors duration-300"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white/70 dark:bg-slate-800/70 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-school-400 dark:focus:ring-school-500 focus:border-school-500 dark:focus:border-school-600 transition-all text-sm"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 transition-colors duration-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white/70 dark:bg-slate-800/70 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-school-400 dark:focus:ring-school-500 focus:border-school-500 dark:focus:border-school-600 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-school-600 hover:bg-school-700 dark:bg-school-600 dark:hover:bg-school-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-500 transition-all disabled:opacity-75 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Ingresar
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
