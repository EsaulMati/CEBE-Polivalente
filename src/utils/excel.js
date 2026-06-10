import * as XLSX from 'xlsx';

// Mapa de sinónimos de columnas para normalizar
const COLUMN_MAP = {
  'item': 'Item',
  'código': 'Item',
  'codigo': 'Item',
  'id': 'Item',
  'código interno': 'Item',
  'codigo interno': 'Item',
  'cod_interno': 'Item',
  
  'producto': 'Producto',
  'nombre': 'Producto',
  'bien': 'Producto',
  'artículo': 'Producto',
  'articulo': 'Producto',
  
  'área': 'Área',
  'area': 'Área',
  'ubicación': 'Área',
  'ubicacion': 'Área',
  
  'descripción': 'Descripción',
  'descripcion': 'Descripción',
  'detalle': 'Descripción',
  
  'alto': 'Alto',
  'altura': 'Alto',
  'ancho': 'Ancho',
  'anchura': 'Ancho',
  'largo': 'Largo',
  'longitud': 'Largo',
  
  'marca': 'Marca',
  'fabricante': 'Marca',
  
  'observación': 'Observación',
  'observacion': 'Observación',
  'observaciones': 'Observación',
  'notas': 'Observación',
  
  'estado': 'Estado',
  'condición': 'Estado',
  
  'código patrimonial': 'Código patrimonial',
  'codigo patrimonial': 'Código patrimonial',
  'cod_patrimonial': 'Código patrimonial',
  'placa patrimonial': 'Código patrimonial',
  'patrimonio': 'Código patrimonial',
  
  'inventariado': 'Inventariado',
  'inventariar': 'Inventariado'
};

const EXPECTED_COLUMNS = [
  "Item",
  "Producto",
  "Área",
  "Descripción",
  "Alto",
  "Ancho",
  "Largo",
  "Marca",
  "Observación",
  "Estado",
  "Código patrimonial",
  "Inventariado"
];

/**
 * Normaliza una fila cargada de Excel para asegurar que cumple con el esquema esperado
 */
export const normalizeRow = (row) => {
  const normalized = {};
  
  // Crear una versión en minúsculas y sin espacios de las llaves de la fila original
  const cleanedRow = {};
  Object.keys(row).forEach(key => {
    const cleanKey = key.toString().trim().toLowerCase();
    cleanedRow[cleanKey] = row[key];
  });

  // Mapear cada columna esperada
  EXPECTED_COLUMNS.forEach(col => {
    let foundValue = "";
    
    // Buscar correspondencia en el mapa de sinónimos
    Object.keys(COLUMN_MAP).forEach(mapKey => {
      if (COLUMN_MAP[mapKey] === col && cleanedRow[mapKey] !== undefined) {
        foundValue = cleanedRow[mapKey];
      }
    });
    
    // Si no se encontró mediante sinónimos, buscar correspondencia por nombre exacto en minúsculas
    if (foundValue === "") {
      const colClean = col.toLowerCase();
      if (cleanedRow[colClean] !== undefined) {
        foundValue = cleanedRow[colClean];
      }
    }

    // Limpiar el valor final
    let finalValue = foundValue !== null && foundValue !== undefined ? foundValue.toString().trim() : "";
    
    // Validaciones especiales para selects específicos
    if (col === "Estado") {
      // Opciones válidas: Bueno, Regular, Malo, Muy malo, Nuevo
      const states = ["Bueno", "Regular", "Malo", "Muy malo", "Nuevo"];
      const matchedState = states.find(s => s.toLowerCase() === finalValue.toLowerCase());
      finalValue = matchedState || "Bueno"; // Fallback por defecto
    }
    
    if (col === "Inventariado") {
      // Opciones válidas: Sí, No
      const isYes = ["sí", "si", "yes", "y", "s", "true", "1", "inventariado"].includes(finalValue.toLowerCase());
      finalValue = isYes ? "Sí" : "No";
    }

    normalized[col] = finalValue;
  });

  return normalized;
};

/**
 * Procesa un archivo subido por el usuario y lo convierte a JSON estructurado
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (workbook.SheetNames.length === 0) {
          throw new Error("El archivo Excel no contiene hojas de cálculo.");
        }
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Leer hoja convirtiendo celdas a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        // Normalizar filas
        const normalizedData = jsonData.map(row => normalizeRow(row));
        
        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Genera y descarga un archivo Excel a partir de un listado JSON
 */
export const exportToExcel = (data, filename = 'inventario_cebe_polivalente.xlsx') => {
  // Asegurarnos de que el array tenga la estructura ordenada
  const orderedData = data.map(item => {
    const row = {};
    EXPECTED_COLUMNS.forEach(col => {
      row[col] = item[col] || "";
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(orderedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario Escolar');
  
  // Ajustar anchos de columnas básicos para legibilidad
  const wscols = EXPECTED_COLUMNS.map(col => {
    if (col === "Descripción" || col === "Observación") return { wch: 30 };
    if (col === "Producto") return { wch: 25 };
    return { wch: 15 };
  });
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, filename);
};

/**
 * Descarga una plantilla de Excel con la estructura correcta y datos de ejemplo
 */
export const downloadTemplate = () => {
  const templateData = [
    {
      "Item": "CEBE-001",
      "Producto": "Silla Escolar Infantil",
      "Área": "Aula Verde",
      "Descripción": "Silla de madera barnizada patas de metal",
      "Alto": "60",
      "Ancho": "40",
      "Largo": "40",
      "Marca": "Escolaris",
      "Observación": "Excelente estado",
      "Estado": "Nuevo",
      "Código patrimonial": "PAT-2026-001",
      "Inventariado": "Sí"
    },
    {
      "Item": "CEBE-002",
      "Producto": "Proyector Multimedia",
      "Área": "Biblioteca",
      "Descripción": "Proyector marca Epson color negro HDMI",
      "Alto": "15",
      "Ancho": "30",
      "Largo": "25",
      "Marca": "Epson",
      "Observación": "Lampara con pocas horas de uso",
      "Estado": "Bueno",
      "Código patrimonial": "PAT-2026-002",
      "Inventariado": "No"
    }
  ];
  exportToExcel(templateData, 'plantilla_inventario_cebe.xlsx');
};
