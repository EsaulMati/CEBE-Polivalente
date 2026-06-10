import React from 'react';
import { 
  X, 
  Hash, 
  Package, 
  MapPin, 
  AlignLeft, 
  Maximize2, 
  Tag, 
  FileText, 
  Info, 
  Shield, 
  Calendar 
} from 'lucide-react';

export default function ItemDetailModal({ item, onClose }) {
  if (!item) return null;

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Nuevo': return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Bueno': return 'bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'Regular': return 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Malo': return 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Muy malo': return 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const cardClass = "flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors duration-300";
  const labelClass = "text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider";
  const valueClass = "text-sm font-semibold text-slate-800 dark:text-slate-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop con desenfoque de fondo */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Contenido del Modal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 animate-scale-up transition-colors duration-300">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-school-700 to-school-600 px-6 py-4 flex items-center justify-between text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-white/80" />
            <div>
              <h3 className="text-lg font-bold">Detalle del Activo Escolar</h3>
              <p className="text-[10px] text-slate-200 font-semibold uppercase tracking-wider">{item.Item}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Código Interno / Item */}
            <div className={cardClass}>
              <Hash className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className={labelClass}>Código Interno (Item)</span>
                <p className="text-sm font-extrabold text-school-700 dark:text-school-400">{item.Item}</p>
              </div>
            </div>

            {/* Código Patrimonial */}
            <div className={cardClass}>
              <Shield className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className={labelClass}>Código Patrimonial</span>
                <p className="text-sm font-mono font-extrabold text-slate-800 dark:text-slate-200">{item['Código patrimonial'] || '—'}</p>
              </div>
            </div>

            {/* Producto */}
            <div className={cardClass}>
              <Package className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className={labelClass}>Producto</span>
                <p className={valueClass}>{item.Producto}</p>
              </div>
            </div>

            {/* Área */}
            <div className={cardClass}>
              <MapPin className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className={labelClass}>Área / Ubicación</span>
                <p className={valueClass}>{item.Área}</p>
              </div>
            </div>

            {/* Marca */}
            <div className={cardClass}>
              <Tag className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className={labelClass}>Marca</span>
                <p className={valueClass}>{item.Marca || '—'}</p>
              </div>
            </div>

            {/* Medidas */}
            <div className={cardClass}>
              <Maximize2 className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className={labelClass}>Medidas (Alto x Ancho x Largo)</span>
                <p className={valueClass}>
                  {item.Alto || item.Ancho || item.Largo 
                    ? `${item.Alto || '?'} x ${item.Ancho || '?'} x ${item.Largo || '?'} cm`
                    : '—'
                  }
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className={cardClass}>
              <Info className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className={`${labelClass} block mb-1`}>Estado Físico</span>
                <span className={`px-2.5 py-1 text-xs rounded-full border font-bold ${getEstadoClass(item.Estado)}`}>
                  {item.Estado}
                </span>
              </div>
            </div>

            {/* Inventariado */}
            <div className={cardClass}>
              <Calendar className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className={`${labelClass} block mb-1`}>Inventariado</span>
                <span className={`px-2.5 py-1 text-xs rounded-full border font-bold ${
                  item.Inventariado === 'Sí'
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                  {item.Inventariado === 'Sí' ? 'Sí (Confirmado)' : 'No (Pendiente)'}
                </span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className={`${cardClass} p-4`}>
            <AlignLeft className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
            <div className="w-full">
              <span className={labelClass}>Descripción del bien</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line mt-1">
                {item.Descripción || 'Sin descripción detallada.'}
              </p>
            </div>
          </div>

          {/* Observaciones */}
          <div className={`${cardClass} p-4`}>
            <FileText className="w-5 h-5 text-school-500 dark:text-school-400 mt-0.5 flex-shrink-0" />
            <div className="w-full">
              <span className={labelClass}>Observaciones / Notas</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line mt-1">
                {item.Observación || 'Ninguna observación registrada.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <button
            onClick={onClose}
            className="bg-school-600 hover:bg-school-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all active:scale-95 cursor-pointer shadow"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
