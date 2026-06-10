import React, { useState, useEffect, useRef } from 'react';
import { Save, PlusCircle, RotateCcw, AlertCircle, ArrowLeft } from 'lucide-react';

export default function RegisterItem({ 
  inventory, 
  onSave, 
  editItem, 
  setEditItem, 
  setActiveTab 
}) {
  // Estados de campos del formulario
  const [itemCode, setItemCode] = useState('');
  const [product, setProduct] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [alto, setAlto] = useState('');
  const [ancho, setAncho] = useState('');
  const [largo, setLargo] = useState('');
  const [marca, setMarca] = useState('');
  const [observation, setObservation] = useState('');
  const [estado, setEstado] = useState('Nuevo');
  const [patrimonialCode, setPatrimonialCode] = useState('');
  const [inventariado, setInventariado] = useState('Sí');

  // Control de feedback de errores y éxito
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estados para autocompletado de áreas
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const areaRef = useRef(null);

  // Obtener todas las áreas únicas actuales
  const uniqueAreas = React.useMemo(() => {
    const areas = inventory.map(item => item.Área).filter(Boolean);
    return [...new Set(areas)];
  }, [inventory]);

  // Si estamos en modo edición, cargar datos
  useEffect(() => {
    if (editItem) {
      setItemCode(editItem.Item || '');
      setProduct(editItem.Producto || '');
      setArea(editItem.Área || '');
      setDescription(editItem.Descripción || '');
      setAlto(editItem.Alto || '');
      setAncho(editItem.Ancho || '');
      setLargo(editItem.Largo || '');
      setMarca(editItem.Marca || '');
      setObservation(editItem.Observación || '');
      setEstado(editItem.Estado || 'Nuevo');
      setPatrimonialCode(editItem['Código patrimonial'] || '');
      setInventariado(editItem.Inventariado || 'Sí');
    }
  }, [editItem]);

  // Cerrar lista de sugerencias de área cuando se hace clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (areaRef.current && !areaRef.current.contains(event.target)) {
        setShowAreaSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtrar sugerencias de área basadas en lo que el usuario escribe
  const handleAreaChange = (e) => {
    const value = e.target.value;
    setArea(value);
    
    if (value.trim() === '') {
      setAreaSuggestions(uniqueAreas);
    } else {
      const filtered = uniqueAreas.filter(a => 
        a.toLowerCase().includes(value.toLowerCase())
      );
      setAreaSuggestions(filtered);
    }
    setShowAreaSuggestions(true);
  };

  const selectArea = (selectedArea) => {
    setArea(selectedArea);
    setShowAreaSuggestions(false);
  };

  const handleReset = () => {
    setItemCode('');
    setProduct('');
    setArea('');
    setDescription('');
    setAlto('');
    setAncho('');
    setLargo('');
    setMarca('');
    setObservation('');
    setEstado('Nuevo');
    setPatrimonialCode('');
    setInventariado('Sí');
    setValidationError('');
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setEditItem(null);
    setActiveTab('search');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    // Validaciones obligatorias
    if (!itemCode.trim()) {
      setValidationError('El campo "Item / código interno" es obligatorio.');
      return;
    }
    if (!product.trim()) {
      setValidationError('El campo "Producto" es obligatorio.');
      return;
    }
    if (!area.trim()) {
      setValidationError('El campo "Área" es obligatorio.');
      return;
    }
    if (!estado) {
      setValidationError('El campo "Estado" es obligatorio.');
      return;
    }

    const newItem = {
      "Item": itemCode.trim(),
      "Producto": product.trim(),
      "Área": area.trim(),
      "Descripción": description.trim(),
      "Alto": alto.trim(),
      "Ancho": ancho.trim(),
      "Largo": largo.trim(),
      "Marca": marca.trim(),
      "Observación": observation.trim(),
      "Estado": estado,
      "Código patrimonial": patrimonialCode.trim(),
      "Inventariado": inventariado
    };

    setIsSaving(true);
    try {
      const response = await onSave(newItem, !!editItem);
      
      if (response.success) {
        setSuccessMessage(editItem ? 'Ítem actualizado correctamente.' : 'Ítem registrado correctamente.');
        
        if (editItem) {
          setTimeout(() => {
            setEditItem(null);
            setActiveTab('search');
          }, 1500);
        } else {
          handleReset();
        }
      } else {
        setValidationError(response.message || 'Error al guardar el ítem.');
      }
    } catch (err) {
      console.error(err);
      setValidationError('Error inesperado al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  // Clases reutilizables
  const inputClass = "w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-school-400 dark:focus:ring-school-500 focus:border-school-500 dark:focus:border-school-600 transition-all text-sm font-medium";
  const selectClass = "w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-school-400 dark:focus:ring-school-500 focus:border-school-500 dark:focus:border-school-600 transition-all text-sm font-semibold";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 transition-colors duration-300";
  const smallInputClass = "w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm transition-colors duration-300";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Botón de Regresar si se está editando */}
      {editItem && (
        <button 
          onClick={handleCancelEdit}
          className="flex items-center gap-2 text-school-600 dark:text-school-400 hover:text-school-700 dark:hover:text-school-300 font-bold mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la búsqueda
        </button>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-premium dark:shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        {/* Cabecera del formulario */}
        <div className="bg-gradient-to-r from-school-600 to-school-500 p-6 text-white flex items-center gap-4">
          <PlusCircle className="w-8 h-8 text-white/90" />
          <div>
            <h2 className="text-xl font-bold">{editItem ? 'Editar Ítem del Inventario' : 'Registrar Nuevo Bien Escolar'}</h2>
            <p className="text-xs text-slate-200 mt-1">Completa los campos para actualizar la base de datos de CEBE Polivalente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Alertas */}
          {validationError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-semibold transition-colors duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-red-400" />
              <span>{validationError}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl text-sm font-semibold transition-colors duration-300">
              <Save className="w-5 h-5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo 1: Item / Código Interno */}
            <div>
              <label className={labelClass}>
                Item / Código Interno <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                disabled={!!editItem}
                placeholder="Ej. CEBE-045"
                className={`${inputClass} font-semibold disabled:bg-slate-100 dark:disabled:bg-slate-800/50 disabled:text-slate-500 dark:disabled:text-slate-500`}
              />
              {editItem && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">El código único no se puede cambiar.</span>
              )}
            </div>

            {/* Campo 2: Producto */}
            <div>
              <label className={labelClass}>
                Producto / Activo <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Ej. Silla de Ruedas, Mesa Telescópica"
                className={inputClass}
              />
            </div>

            {/* Campo 3: Área (Autocomplete) */}
            <div className="relative" ref={areaRef}>
              <label className={labelClass}>
                Área / Ubicación <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                value={area}
                onChange={handleAreaChange}
                onFocus={() => {
                  setAreaSuggestions(area ? uniqueAreas.filter(a => a.toLowerCase().includes(area.toLowerCase())) : uniqueAreas);
                  setShowAreaSuggestions(true);
                }}
                placeholder="Escribe o selecciona un área"
                className={inputClass}
              />
              {showAreaSuggestions && areaSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-slate-950/50 max-h-48 overflow-y-auto">
                  {areaSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectArea(item)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 font-medium border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Campo 4: Marca */}
            <div>
              <label className={labelClass}>
                Marca / Fabricante
              </label>
              <input 
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej. Orthofit, Sin Marca"
                className={inputClass}
              />
            </div>

            {/* Medidas (Alto, Ancho, Largo) */}
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 transition-colors duration-300">
              <span className={labelClass}>Dimensiones (en centímetros)</span>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Alto</label>
                  <input 
                    type="number"
                    value={alto}
                    onChange={(e) => setAlto(e.target.value)}
                    placeholder="Alto"
                    className={smallInputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Ancho</label>
                  <input 
                    type="number"
                    value={ancho}
                    onChange={(e) => setAncho(e.target.value)}
                    placeholder="Ancho"
                    className={smallInputClass}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Largo</label>
                  <input 
                    type="number"
                    value={largo}
                    onChange={(e) => setLargo(e.target.value)}
                    placeholder="Largo"
                    className={smallInputClass}
                  />
                </div>
              </div>
            </div>

            {/* Campo 5: Estado */}
            <div>
              <label className={labelClass}>
                Estado Físico <span className="text-red-500">*</span>
              </label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className={selectClass}>
                <option value="Nuevo">Nuevo</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Malo">Malo</option>
                <option value="Muy malo">Muy malo</option>
              </select>
            </div>

            {/* Campo 6: Inventariado */}
            <div>
              <label className={labelClass}>
                ¿Inventariado oficialmente? <span className="text-red-500">*</span>
              </label>
              <select value={inventariado} onChange={(e) => setInventariado(e.target.value)} className={selectClass}>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Campo 7: Código Patrimonial */}
            <div>
              <label className={labelClass}>
                Código Patrimonial
              </label>
              <input 
                type="text"
                value={patrimonialCode}
                onChange={(e) => setPatrimonialCode(e.target.value)}
                placeholder="Ej. PAT-2024-0012"
                className={inputClass}
              />
            </div>

            {/* Campo 8: Descripción */}
            <div className="md:col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalla las características físicas específicas del bien..."
                rows="3"
                className={inputClass}
              ></textarea>
            </div>

            {/* Campo 9: Observación */}
            <div className="md:col-span-2">
              <label className={labelClass}>Observación</label>
              <textarea 
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Escribe detalles sobre reparaciones necesarias o notas de uso..."
                rows="2"
                className={inputClass}
              ></textarea>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col sm:flex-row justify-end gap-3 transition-colors duration-300">
            {!editItem && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-lg text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Limpiar formulario
              </button>
            )}

            {editItem && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-lg text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-school-600 hover:bg-school-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editItem ? 'Guardar Cambios' : 'Guardar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
