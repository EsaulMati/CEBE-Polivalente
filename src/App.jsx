import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import RegisterItem from "./components/RegisterItem";
import SearchInventory from "./components/SearchInventory";
import ItemDetailModal from "./components/ItemDetailModal";
import DiagnosticsModal from "./components/DiagnosticsModal";
import { useToast } from "./components/Toast";

import {
  fetchInventory,
  addItem,
  updateItem,
  deleteItem,
} from "./utils/sheetsApi";
import { Loader2 } from "lucide-react";
import { IS_DEMO_MODE } from "./config";

export default function App() {
  const toast = useToast();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("cebe_auth") === "true";
  });

  const [activeTab, setActiveTab] = useState("home");
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Estados para Edición y Ver Detalle
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  // Estado para el modal de diagnósticos
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Estados para persistir filtros entre pestañas (Mejora #9)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterInventariado, setFilterInventariado] = useState("");
  const [filterProducto, setFilterProducto] = useState("");

  // Estado de la última sincronización (Mejora #12)
  const [lastSync, setLastSync] = useState(() => {
    return localStorage.getItem("cebe_last_sync") || null;
  });

  // Cargar inventario al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      loadInventoryData();
    }
  }, [isAuthenticated]);

  // Auto-refresh automático cada 5 minutos en segundo plano (Mejora #13)
  useEffect(() => {
    if (!isAuthenticated || IS_DEMO_MODE) return;

    const interval = setInterval(
      () => {
        loadInventoryData(true); // Pasar flag para indicar que es silencioso o de fondo si se desea, o normal
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadInventoryData = async (isBackground = false) => {
    if (!isBackground) {
      setIsLoading(true);
    }
    setConnectionError(false);
    try {
      const data = await fetchInventory();
      setInventory(data);

      const now =
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        " " +
        new Date().toLocaleDateString();
      localStorage.setItem("cebe_last_sync", now);
      setLastSync(now);

      if (!isBackground) {
        toast.success("Inventario cargado y sincronizado.");
      }
    } catch (err) {
      console.error("Error cargando inventario:", err);
      setConnectionError(true);
      if (!isBackground) {
        toast.error(
          "Error al sincronizar con Google Sheets. Mostrando datos locales.",
        );
      }
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem("cebe_auth", "true");
    setIsAuthenticated(true);
    toast.success("¡Inicio de sesión exitoso! Bienvenido.");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cebe_auth");
    sessionStorage.removeItem("cebe_token");
    sessionStorage.removeItem("cebe_user");
    setIsAuthenticated(false);
    setActiveTab("home");
    setInventory([]);
    // Limpiar también filtros al cerrar sesión para mayor seguridad/limpieza
    setSearchTerm("");
    setFilterArea("");
    setFilterEstado("");
    setFilterInventariado("");
    setFilterProducto("");
    toast.info("Sesión cerrada correctamente.");
  };

  // Guardar (tanto agregar como actualizar)
  const handleSaveItem = async (item, isEdit) => {
    setIsLoading(true);
    try {
      let response;
      if (isEdit) {
        response = await updateItem(item);
        if (response.success) {
          setInventory((prev) =>
            prev.map((i) =>
              i.Item.trim().toLowerCase() === item.Item.trim().toLowerCase()
                ? item
                : i,
            ),
          );
          toast.success("Ítem actualizado en la nube correctamente.");
        } else {
          toast.error(response.message || "Error al actualizar el ítem.");
        }
      } else {
        response = await addItem(item);
        if (response.success) {
          setInventory((prev) => [...prev, item]);
          toast.success("Ítem guardado y registrado correctamente.");
        } else {
          toast.error(response.message || "Error al registrar el ítem.");
        }
      }
      return response;
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar la solicitud en Google Sheets.");
      return {
        success: false,
        message: "Error al procesar la solicitud en Google Sheets.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar
  const handleDeleteItem = async (itemCode) => {
    setIsLoading(true);
    try {
      const response = await deleteItem(itemCode);
      if (response.success) {
        setInventory((prev) =>
          prev.filter(
            (i) =>
              i.Item.trim().toLowerCase() !== itemCode.trim().toLowerCase(),
          ),
        );
        toast.success("Ítem eliminado correctamente.");
      } else {
        toast.error(response.message || "Error al eliminar el ítem.");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        "Error de conexión al intentar comunicarse con Google Sheets.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar flujo de edición
  const handleStartEdit = (item) => {
    setEditItem(item);
    setActiveTab("register"); // Cambiar al formulario de registro en modo edición
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans relative transition-colors duration-300">
      {/* Navbar Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "register") {
            setEditItem(null); // Limpiar modo edición al navegar a otras pestañas
          }
        }}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Cargador Global Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-xl shadow-premium border border-slate-100 dark:border-slate-800 flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-200">
            <Loader2 className="w-5 h-5 text-school-600 dark:text-school-400 animate-spin" />
            Sincronizando con la nube...
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 pb-16">
        {activeTab === "home" && (
          <Home
            inventory={inventory}
            isLoading={isLoading}
            onRefresh={() => loadInventoryData(false)}
            setActiveTab={setActiveTab}
            connectionError={connectionError}
            lastSync={lastSync}
          />
        )}

        {activeTab === "register" && (
          <RegisterItem
            inventory={inventory}
            onSave={handleSaveItem}
            editItem={editItem}
            setEditItem={setEditItem}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "search" && (
          <SearchInventory
            inventory={inventory}
            onEdit={handleStartEdit}
            onDelete={handleDeleteItem}
            onViewDetail={setDetailItem}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterArea={filterArea}
            setFilterArea={setFilterArea}
            filterEstado={filterEstado}
            setFilterEstado={setFilterEstado}
            filterInventariado={filterInventariado}
            setFilterInventariado={setFilterInventariado}
            filterProducto={filterProducto}
            setFilterProducto={setFilterProducto}
          />
        )}
      </main>

      {/* Modal de Detalle */}
      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
        />
      )}

      {/* Modal de Diagnósticos */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* Pie de Página Escolar */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium w-full mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} CEBE Polivalente - Sistema de
          Inventario Interno. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
