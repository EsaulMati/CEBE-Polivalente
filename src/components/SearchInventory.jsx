import React, { useState, useMemo } from 'react';
import { Search, Filter, X, ArrowUpDown, ChevronDown, Download } from 'lucide-react';
import InventoryTable from './InventoryTable';
import { exportToExcel } from '../utils/excel';
import { useToast } from './Toast';

export default function SearchInventory({ 
  inventory, 
  onEdit, 
  onDelete, 
  onViewDetail,
  searchTerm,
  setSearchTerm,
  filterArea,
  setFilterArea,
  filterEstado,
  setFilterEstado,
  filterInventariado,
  setFilterInventariado,
  filterProducto,
  setFilterProducto
}) {
  const toast = useToast();

  const handleExportFiltered = () => {
    try {
      if (filteredInventory.length === 0) {
        toast.info("No hay resultados para exportar.");
        return;
      }
      exportToExcel(filteredInventory, 'bienes_filtrados_cebe.xlsx');
      toast.success(`Se exportaron ${filteredInventory.length} activos filtrados.`);
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar los datos a Excel.");
    }
  };

  // Extraer valores únicos del inventario actual para rellenar los selects de filtros
  const filterOptions = useMemo(() => {
    const areas = new Set();
    const productos = new Set();
    
    inventory.forEach(item => {
      if (item.Área) areas.add(item.Área);
      if (item.Producto) productos.add(item.Producto);
    });

    return {
      areas: [...areas].sort(),
      productos: [...productos].sort()
    };
  }, [inventory]);

  // Lógica de filtrado en memoria
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Búsqueda general
      const matchesSearch = !searchTerm.trim() || [
        item.Item,
        item.Producto,
        item.Descripción,
        item.Marca,
        item['Código patrimonial'],
        item.Área
      ].some(field => 
        field && field.toString().toLowerCase().includes(searchTerm.toLowerCase().trim())
      );

      // Filtros específicos
      const matchesArea = !filterArea || item.Área === filterArea;
      const matchesEstado = !filterEstado || item.Estado === filterEstado;
      const matchesInventariado = !filterInventariado || item.Inventariado === filterInventariado;
      const matchesProducto = !filterProducto || item.Producto === filterProducto;

      return matchesSearch && matchesArea && matchesEstado && matchesInventariado && matchesProducto;
    });
  }, [inventory, searchTerm, filterArea, filterEstado, filterInventariado, filterProducto]);

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterArea('');
    setFilterEstado('');
    setFilterInventariado('');
    setFilterProducto('');
  };

  const hasActiveFilters = searchTerm !== '' || filterArea !== '' || filterEstado !== '' || filterInventariado !== '' || filterProducto !== '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Contenedor de Filtros */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-premium dark:shadow-2xl border border-slate-100 dark:border-slate-800/80 space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Filter className="w-5 h-5 text-school-500" />
            Filtros de Búsqueda
          </h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs font-bold text-red-650 hover:text-red-750 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-transparent dark:border-red-900/30 px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Buscador General */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, producto, descripción, marca o área..."
            className="block w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/30 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-400 focus:border-school-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-medium shadow-inner"
          />
        </div>

        {/* Rejilla de Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por Producto */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Filtrar por Producto
            </label>
            <div className="relative">
              <select
                value={filterProducto}
                onChange={(e) => setFilterProducto(e.target.value)}
                className="block w-full appearance-none px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-school-400 dark:focus:ring-school-500 text-xs font-semibold pr-8 transition-colors duration-300"
              >
                <option value="">Todos los productos</option>
                {filterOptions.productos.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 dark:text-slate-550">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filtro por Área */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Filtrar por Área
            </label>
            <div className="relative">
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="block w-full appearance-none px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-school-400 dark:focus:ring-school-500 text-xs font-semibold pr-8 transition-colors duration-300"
              >
                <option value="">Todas las áreas</option>
                {filterOptions.areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 dark:text-slate-550">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Filtrar por Estado
            </label>
            <div className="relative">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="block w-full appearance-none px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-school-400 dark:focus:ring-school-500 text-xs font-semibold pr-8 transition-colors duration-300"
              >
                <option value="">Todos los estados</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Malo">Malo</option>
                <option value="Muy malo">Muy malo</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 dark:text-slate-550">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Filtro por Inventariado */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              ¿Inventariado?
            </label>
            <div className="relative">
              <select
                value={filterInventariado}
                onChange={(e) => setFilterInventariado(e.target.value)}
                className="block w-full appearance-none px-3 py-2 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-school-400 dark:focus:ring-school-500 text-xs font-semibold pr-8 transition-colors duration-300"
              >
                <option value="">Cualquier estado</option>
                <option value="Sí">Sí (Inventariado)</option>
                <option value="No">No (Pendiente)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 dark:text-slate-550">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-premium dark:shadow-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">
            Lista de Bienes
            <span className="ml-2 bg-school-50 dark:bg-school-900/50 text-school-700 dark:text-school-300 text-xs font-extrabold px-2.5 py-1 rounded-full transition-colors duration-300">
              {filteredInventory.length} {filteredInventory.length === 1 ? 'coincidencia' : 'coincidencias'}
            </span>
          </h3>
          
          <button
            onClick={handleExportFiltered}
            disabled={filteredInventory.length === 0}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-705 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar filtrados (.xlsx)
          </button>
        </div>
        
        <InventoryTable 
          filteredInventory={filteredInventory}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetail={onViewDetail}
        />
      </div>
    </div>
  );
}
