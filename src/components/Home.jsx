import React from 'react';
import { 
  PlusCircle, 
  Search, 
  RefreshCw, 
  Database, 
  AlertCircle,
  CheckCircle,
  Archive,
  BarChart2
} from 'lucide-react';
import { IS_DEMO_MODE } from '../config';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

export default function Home({ 
  inventory, 
  isLoading, 
  onRefresh, 
  setActiveTab,
  connectionError,
  lastSync
}) {
  const [syncSuccess, setSyncSuccess] = React.useState(false);

  const handleSyncClick = async () => {
    if (isLoading) return;
    setSyncSuccess(false);
    try {
      await onRefresh();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Calcular métricas para el Dashboard
  const totalItems = inventory.length;
  const inventariadosCount = inventory.filter(item => item.Inventariado === 'Sí').length;
  const inventariadosPercent = totalItems > 0 ? Math.round((inventariadosCount / totalItems) * 100) : 0;
  
  const estadoNuevoCount = inventory.filter(item => item.Estado === 'Nuevo').length;
  const estadoBuenoCount = inventory.filter(item => item.Estado === 'Bueno').length;
  const estadoRegularCount = inventory.filter(item => item.Estado === 'Regular').length;
  const estadoMaloCount = inventory.filter(item => item.Estado === 'Malo').length;
  const estadoMuyMaloCount = inventory.filter(item => item.Estado === 'Muy malo').length;

  const totalOperativos = estadoNuevoCount + estadoBuenoCount;
  const totalMantenimiento = estadoRegularCount + estadoMaloCount + estadoMuyMaloCount;

  // Animaciones para contadores
  const animatedTotalItems = useAnimatedCounter(totalItems);
  const animatedInventariadosCount = useAnimatedCounter(inventariadosCount);
  const animatedInventariadosPercent = useAnimatedCounter(inventariadosPercent);
  const animatedTotalOperativos = useAnimatedCounter(totalOperativos);
  const animatedTotalMantenimiento = useAnimatedCounter(totalMantenimiento);

  // Agrupar por áreas principales (top 4)
  const areasMap = {};
  inventory.forEach(item => {
    const area = item.Área || 'Sin Área';
    areasMap[area] = (areasMap[area] || 0) + 1;
  });
  const sortedAreas = Object.entries(areasMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Banner de Bienvenida y Estado de la Conexión */}
      <div className="bg-gradient-to-r from-school-700 to-school-600 rounded-2xl p-6 sm:p-8 text-white shadow-premium relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">CEBE Polivalente</h1>
            <p className="text-slate-200 mt-2 font-medium max-w-xl">
              Bienvenido al sistema de inventario escolar. Aquí puedes registrar, buscar y auditar todos los activos de la institución en tiempo real.
            </p>
            {lastSync && (
              <p className="text-[11px] text-school-150 font-bold bg-white/10 dark:bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg inline-block mt-3 backdrop-blur-sm">
                Última sincronización: {lastSync}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {IS_DEMO_MODE ? (
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-200 px-4 py-2.5 rounded-xl text-sm font-semibold glass-card">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-300" />
                <div>
                  <span className="block font-bold">Modo Demo Activo</span>
                  <span className="text-xs text-amber-300 font-normal">Datos almacenados en el navegador.</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-white/20 border border-white/30 text-white px-4 py-2.5 rounded-xl text-sm font-semibold backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <div>
                  <span className="block font-bold">Google Sheets</span>
                  <span className="text-xs text-white/80 font-normal">Conectado en tiempo real</span>
                </div>
              </div>
            )}

            {!IS_DEMO_MODE && (
              <button 
                onClick={handleSyncClick}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 border active:scale-95 transition-all text-white px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 ${
                  syncSuccess 
                    ? 'bg-emerald-650 hover:bg-emerald-700 border-emerald-500 shadow-md' 
                    : 'bg-white/10 hover:bg-white/20 border-white/20'
                }`}
              >
                {syncSuccess ? (
                  <CheckCircle className="w-4 h-4 text-emerald-300 animate-bounce" />
                ) : (
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                )}
                {syncSuccess ? 'Sincronizado' : 'Sincronizar'}
              </button>
            )}
          </div>
        </div>
      </div>
      {connectionError && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex gap-3 text-red-800 dark:text-red-300 transition-colors duration-300">
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-650 dark:text-red-400" />
          <div>
            <h4 className="font-bold text-sm">Error de conexión con Google Sheets</h4>
            <p className="text-xs text-red-700 dark:text-red-400/90 mt-1">
              No se pudo conectar al script configurado. Asegúrate de que la URL en `src/config.js` esté bien copiada y el script esté publicado correctamente con acceso a "Cualquiera". Mostrando copia local en memoria.
            </p>
          </div>
        </div>
      )}

      {/* DASHBOARD DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total de Items */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-premium dark:shadow-2xl border border-slate-100 dark:border-slate-800/80 transition-all duration-300 hover:shadow-premium-hover hover:dark:border-slate-700 flex items-center gap-5">
          <div className="p-4 bg-school-50 dark:bg-school-900/50 text-school-600 dark:text-school-400 rounded-xl">
            <Archive className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total de Bienes</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{animatedTotalItems}</h3>
          </div>
        </div>

        {/* Card 2: Porcentaje Inventariado */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-premium dark:shadow-2xl border border-slate-100 dark:border-slate-800/80 transition-all duration-300 hover:shadow-premium-hover hover:dark:border-slate-700 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {/* Círculo de progreso circular simple en SVG */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-800" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                stroke="currentColor" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray="175.9" 
                strokeDashoffset={175.9 - (175.9 * animatedInventariadosPercent) / 100}
                strokeLinecap="round" 
                className="text-school-500 dark:text-school-400 transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-slate-700 dark:text-slate-200">
              {animatedInventariadosPercent}%
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Inventariados</span>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{animatedInventariadosCount} de {animatedTotalItems}</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Bienes validados</span>
          </div>
        </div>

        {/* Card 3: Operativos (Nuevo + Bueno) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-premium dark:shadow-2xl border border-slate-100 dark:border-slate-800/80 transition-all duration-300 hover:shadow-premium-hover hover:dark:border-slate-700 flex items-center gap-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Buen Estado / Nuevo</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{animatedTotalOperativos}</h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-450 font-semibold">Listos para el uso</span>
          </div>
        </div>

        {/* Card 4: Mantenimiento (Regular/Malo/Muy Malo) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-premium dark:shadow-2xl border border-slate-100 dark:border-slate-800/80 transition-all duration-300 hover:shadow-premium-hover hover:dark:border-slate-700 flex items-center gap-5">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Regular o Dañados</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{animatedTotalMantenimiento}</h3>
            <span className="text-xs text-amber-655 dark:text-amber-400 font-semibold">Requieren revisión</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD GRÁFICO RÁPIDO */}
      {totalItems > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distribución por Estado */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-premium border border-slate-100 dark:border-slate-800/80">
            <h3 className="text-md font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-school-500" />
              Distribución por Estado
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Nuevo', count: estadoNuevoCount, color: 'bg-emerald-500' },
                { label: 'Bueno', count: estadoBuenoCount, color: 'bg-teal-500' },
                { label: 'Regular', count: estadoRegularCount, color: 'bg-blue-400' },
                { label: 'Malo', count: estadoMaloCount, color: 'bg-amber-500' },
                { label: 'Muy Malo', count: estadoMuyMaloCount, color: 'bg-red-500' }
              ].map((row) => {
                const percent = totalItems > 0 ? (row.count / totalItems) * 100 : 0;
                return (
                  <div key={row.label} className="space-y-1">
                     <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-650 dark:text-slate-350">{row.label}</span>
                      <span className="text-slate-800 dark:text-slate-205">{row.count} ({Math.round(percent)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Áreas Principales */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-premium border border-slate-100 dark:border-slate-800/80">
            <h3 className="text-md font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-school-500" />
              Áreas con Mayor Inventario
            </h3>
            <div className="space-y-4">
              {sortedAreas.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No hay áreas registradas.</p>
              ) : (
                sortedAreas.map(([area, count]) => {
                  const percent = totalItems > 0 ? (count / totalItems) * 100 : 0;
                  return (
                    <div key={area} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-24 truncate">{area}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-6 rounded-lg overflow-hidden relative flex items-center">
                        <div className="h-full bg-school-200 dark:bg-school-800/40 rounded-lg transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        <span className="absolute left-2 text-[10px] font-extrabold text-school-700 dark:text-school-300">
                          {count} {count === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN DE ACCIONES PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta Registrar Ítem */}
        <button
          onClick={() => setActiveTab('register')}
          className="flex items-center gap-6 p-8 bg-white dark:bg-slate-900 hover:bg-slate-50 hover:dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 hover:border-school-200 dark:hover:border-school-750 rounded-2xl shadow-premium hover:shadow-premium-hover text-left transition-all duration-300 group cursor-pointer"
        >
          <div className="p-5 bg-school-100 dark:bg-school-900/60 text-school-600 dark:text-school-300 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <PlusCircle className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-school-600 dark:group-hover:text-school-400 transition-colors">
              Registrar nuevo ítem
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Agrega un nuevo bien, describe sus características físicas, estado actual y su código interno o patrimonial.
            </p>
          </div>
        </button>

        {/* Tarjeta Buscar Inventario */}
        <button
          onClick={() => setActiveTab('search')}
          className="flex items-center gap-6 p-8 bg-white dark:bg-slate-900 hover:bg-slate-50 hover:dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 hover:border-school-200 dark:hover:border-school-750 rounded-2xl shadow-premium hover:shadow-premium-hover text-left transition-all duration-300 group cursor-pointer"
        >
          <div className="p-5 bg-school-100 dark:bg-school-900/60 text-school-600 dark:text-school-300 rounded-2xl group-hover:scale-110 transition-transform duration-300">
            <Search className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-school-600 dark:group-hover:text-school-400 transition-colors">
              Buscar en inventario
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Filtra los activos por área, estado e inventariado. Busca elementos usando texto, y edítalos o elimínalos.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
