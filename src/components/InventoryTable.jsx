import React, { useState } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Check, AlertTriangle, Archive } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export default function InventoryTable({ 
  filteredInventory, 
  onEdit, 
  onDelete, 
  onViewDetail 
}) {
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado para el modal de confirmación
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Resetear página si cambia la cantidad filtrada
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredInventory.length]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'Nuevo':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Bueno':
        return 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'Regular':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Malo':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Muy malo':
        return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getInventariadoBadgeClass = (inventariado) => {
    return inventariado === 'Sí'
      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
  };

  const formatDimensions = (alto, ancho, largo) => {
    if (!alto && !ancho && !largo) return '—';
    return `${alto || '?'} x ${ancho || '?'} x ${largo || '?'} cm`;
  };

  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.Item);
      setDeleteTarget(null);
    }
  };

  // Paginación inteligente con elipsis (Mejora #10)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages = [];
    pages.push(1);
    
    if (currentPage > 3) pages.push('...');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) pages.push('...');
    
    if (totalPages > 1) pages.push(totalPages);
    
    return pages;
  };

  return (
    <div className="flex flex-col">
      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar bien del inventario"
        message={deleteTarget ? `¿Estás seguro de eliminar "${deleteTarget.Item}" (${deleteTarget.Producto})? Esta acción no se puede deshacer.` : ''}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Contenedor con scroll horizontal para móviles */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border-b border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/70">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Item / Código</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Producto</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Área</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Descripción</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Medidas</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Marca</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cód. Patr.</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Inventariado</th>
                  <th scope="col" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-16 text-center">
                      {/* Mejora #6: Ilustración vacía */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                          <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">No se encontraron activos que coincidan con la búsqueda.</p>
                        <p className="text-xs text-slate-300 dark:text-slate-600">Intenta ajustar los filtros o buscar con otros términos.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr 
                      key={item.Item || index}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-school-600 dark:text-school-400">
                        {item.Item}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {item.Producto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {item.Área}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs truncate" title={item.Descripción}>
                        {item.Descripción || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {formatDimensions(item.Alto, item.Ancho, item.Largo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {item.Marca || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className={`px-2.5 py-1 rounded-full border font-bold ${getEstadoBadgeClass(item.Estado)}`}>
                          {item.Estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                        {item['Código patrimonial'] || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-bold ${getInventariadoBadgeClass(item.Inventariado)}`}>
                          {item.Inventariado === 'Sí' ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {item.Inventariado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium space-x-1">
                        <button
                          onClick={() => onViewDetail(item)}
                          title="Ver detalle completo"
                          className="inline-flex items-center p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 hover:text-school-600 dark:hover:text-school-400 hover:border-school-200 dark:hover:border-school-700 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => onEdit(item)}
                          title="Editar bien"
                          className="inline-flex items-center p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-700 transition-all cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(item)}
                          title="Eliminar bien"
                          className="inline-flex items-center p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-700 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Controles de Paginación */}
      {filteredInventory.length > itemsPerPage && (
        <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 sm:px-6 transition-colors duration-300">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                Mostrando <span className="font-extrabold text-slate-700 dark:text-slate-200">{indexOfFirstItem + 1}</span> a{' '}
                <span className="font-extrabold text-slate-700 dark:text-slate-200">
                  {Math.min(indexOfLastItem, filteredInventory.length)}
                </span>{' '}
                de <span className="font-extrabold text-slate-700 dark:text-slate-200">{filteredInventory.length}</span> resultados
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {getPageNumbers().map((page, idx) => (
                  page === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-400 dark:text-slate-500"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold cursor-pointer transition-colors ${
                        currentPage === page
                          ? 'z-10 bg-school-600 border-school-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
