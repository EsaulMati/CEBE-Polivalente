import React, { useState } from "react";
import logo from "../assets/logo-removebg-preview.png";
import {
  Home,
  PlusCircle,
  Search,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Wrench,
} from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  onLogout,
  isDarkMode,
  toggleDarkMode,
  onOpenDiagnostics,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Inicio", id: "home", icon: Home },
    { name: "Registrar ítem", id: "register", icon: PlusCircle },
    { name: "Buscar inventario", id: "search", icon: Search },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <nav className="bg-school-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre del Sistema */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleTabClick("home")}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 flex items-center justify-center bg-transparent flex-shrink-0 transition-transform group-hover:scale-105">
              <img
                src={logo}
                alt="Logo CEBE"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.innerHTML =
                    '<span class="text-school-700 font-bold text-xs">CEBE</span>';
                }}
              />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight block sm:inline-block">
                CEBE Polivalente
              </span>
              <span className="text-[10px] sm:text-xs block text-slate-300 font-semibold uppercase tracking-wider -mt-1 sm:mt-0">
                Sistema de Inventario
              </span>
            </div>
          </div>

          {/* Menú de Navegación de Escritorio */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-school-700 shadow-sm"
                      : "text-slate-100 hover:bg-school-600 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}

            <div className="h-6 w-[1px] bg-white/20 mx-2"></div>

            <button
              onClick={toggleDarkMode}
              title={
                isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
              className="flex items-center justify-center p-2 rounded-lg text-slate-100 hover:bg-school-600 hover:text-white transition-all cursor-pointer"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>

          {/* Botón de Menú Móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-200 hover:text-white hover:bg-school-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {isOpen && (
        <div className="md:hidden bg-school-800 border-t border-school-600 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive
                    ? "bg-white text-school-800"
                    : "text-slate-200 hover:bg-school-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}

          <div className="border-t border-school-700 my-2 pt-2 space-y-2">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-200 hover:bg-school-700 hover:text-white transition-all cursor-pointer"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-5 h-5 text-amber-300" />
                  Modo claro
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-slate-350" />
                  Modo oscuro
                </>
              )}
            </button>

            <button
              onClick={onOpenDiagnostics}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-200 hover:bg-school-700 hover:text-white transition-all cursor-pointer"
            >
              <Wrench className="w-5 h-5" />
              Diagnósticos
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>

          {/* Botón de Cerrar Menú (Volver) */}
          <div className="px-2 pt-2 pb-4">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-base font-bold bg-slate-700/50 text-white hover:bg-slate-700 transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
