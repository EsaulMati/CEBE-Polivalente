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

const API_URL = normalizeAppsScriptUrl(GOOGLE_SHEETS_API_URL);

// Datos de prueba para inicializar el localStorage en Modo Demo
const MOCK_DATA = [
  {
    Item: "CEBE-001",
    Producto: "Silla de Ruedas Adaptada",
    Área: "Fisioterapia",
    Descripción: "Silla infantil con soporte cervical y reposapiés elevables",
    Alto: "110",
    Ancho: "65",
    Largo: "90",
    Marca: "Orthofit",
    Observación: "Tornillos del reposacabezas ligeramente flojos",
    Estado: "Regular",
    "Código patrimonial": "PAT-2024-001",
    Inventariado: "Sí",
  },
  {
    Item: "CEBE-002",
    Producto: "Mesa Escolar Regulable",
    Área: "Aula Azul",
    Descripción:
      "Mesa de madera con patas metálicas telescópicas regulables en altura",
    Alto: "70",
    Ancho: "80",
    Largo: "60",
    Marca: "Escolaris",
    Observación: "Superficie con rayaduras de uso regular",
    Estado: "Bueno",
    "Código patrimonial": "PAT-2024-002",
    Inventariado: "Sí",
  },
  {
    Item: "CEBE-003",
    Producto: "Colchoneta de Psicomotricidad",
    Área: "Gimnasio",
    Descripción:
      "Colchoneta de espuma de alta densidad, forro azul impermeable lavable",
    Alto: "10",
    Ancho: "100",
    Largo: "200",
    Marca: "Deportex",
    Observación: "Costura lateral reforzada",
    Estado: "Nuevo",
    "Código patrimonial": "PAT-2024-003",
    Inventariado: "No",
  },
  {
    Item: "CEBE-004",
    Producto: "Teclado Adaptado BigKeys",
    Área: "Informática",
    Descripción:
      "Teclado USB con teclas grandes de colores para motricidad fina",
    Alto: "4",
    Ancho: "48",
    Largo: "18",
    Marca: "BigKeys",
    Observación: "Falta tecla F10 pero funciona correctamente",
    Estado: "Regular",
    "Código patrimonial": "PAT-2024-004",
    Inventariado: "Sí",
  },
  {
    Item: "CEBE-005",
    Producto: "Pizarra Blanca Móvil",
    Área: "Aula Verde",
    Descripción:
      "Pizarra acrílica magnética de doble cara con soporte y ruedas",
    Alto: "180",
    Ancho: "120",
    Largo: "50",
    Marca: "Acrilux",
    Observación: "Rueda trasera izquierda rota",
    Estado: "Malo",
    "Código patrimonial": "PAT-2024-005",
    Inventariado: "No",
  },
];

// Inicializar localStorage si no existe
const getLocalDb = () => {
  const db = localStorage.getItem("cebe_inventario_db");
  if (!db) {
    localStorage.setItem("cebe_inventario_db", JSON.stringify(MOCK_DATA));
    return MOCK_DATA;
  }
  return JSON.parse(db);
};

const setLocalDb = (data) => {
  localStorage.setItem("cebe_inventario_db", JSON.stringify(data));
};

// Simulación de retraso de red para dar sensación de aplicación real en demo
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

const FETCH_TIMEOUT_MS = 15000;

const getAuthToken = () => {
  if (typeof sessionStorage === "undefined") return "";
  return sessionStorage.getItem("cebe_token") || "";
};

// Helper para realizar peticiones fetch con tiempo de espera límite (timeout)
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error(
        "La petición a Google Sheets superó el tiempo de espera límite de 15 segundos.",
      );
    }
    throw error;
  }
};

/**
 * Obtener todos los bienes del inventario
 */
export const fetchInventory = async () => {
  if (IS_DEMO_MODE) {
    await delay();
    return getLocalDb();
  }

  try {
    const token = getAuthToken();
    const url = `${API_URL}?action=read&token=${encodeURIComponent(token)}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (data && data.success === false) {
      throw new Error(data.message || "Error de autenticación.");
    }
    throw new Error("Respuesta inesperada al obtener inventario.");
  } catch (error) {
    console.error("Error al obtener inventario de Google Sheets:", error);
    throw error;
  }
};

/**
 * Agregar un nuevo bien
 */
export const addItem = async (item) => {
  if (IS_DEMO_MODE) {
    await delay();
    const db = getLocalDb();

    // Validar duplicado
    const exists = db.some(
      (i) => i.Item.trim().toLowerCase() === item.Item.trim().toLowerCase(),
    );
    if (exists) {
      return {
        success: false,
        message: `El código de Item '${item.Item}' ya existe.`,
      };
    }

    const updated = [...db, item];
    setLocalDb(updated);
    return { success: true, message: "Ítem agregado con éxito (Modo Demo)." };
  }

  try {
    // Usamos text/plain para evitar la petición OPTIONS preflight
    const response = await fetchWithTimeout(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        action: "add",
        data: {
          ...item,
          token: getAuthToken(),
        },
      }),
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al agregar ítem:", error);
    return {
      success: false,
      message: error.message || "Error de red al conectar con Google Sheets.",
    };
  }
};

/**
 * Actualizar un bien existente
 */
export const updateItem = async (item) => {
  if (IS_DEMO_MODE) {
    await delay();
    const db = getLocalDb();
    const index = db.findIndex(
      (i) => i.Item.trim().toLowerCase() === item.Item.trim().toLowerCase(),
    );

    if (index === -1) {
      return {
        success: false,
        message: `No se encontró el ítem con código '${item.Item}'.`,
      };
    }

    const updated = [...db];
    updated[index] = item;
    setLocalDb(updated);
    return {
      success: true,
      message: "Ítem actualizado con éxito (Modo Demo).",
    };
  }

  try {
    const response = await fetchWithTimeout(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        action: "update",
        data: {
          ...item,
          token: getAuthToken(),
        },
      }),
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al actualizar ítem:", error);
    return {
      success: false,
      message: error.message || "Error de red al conectar con Google Sheets.",
    };
  }
};

/**
 * Eliminar un bien
 */
export const deleteItem = async (itemCode) => {
  if (IS_DEMO_MODE) {
    await delay();
    const db = getLocalDb();
    const updated = db.filter(
      (i) => i.Item.trim().toLowerCase() !== itemCode.trim().toLowerCase(),
    );

    if (db.length === updated.length) {
      return {
        success: false,
        message: `No se encontró el ítem con código '${itemCode}'.`,
      };
    }

    setLocalDb(updated);
    return { success: true, message: "Ítem eliminado con éxito (Modo Demo)." };
  }

  try {
    const response = await fetchWithTimeout(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        action: "delete",
        data: {
          item: itemCode,
          token: getAuthToken(),
        },
      }),
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error al eliminar ítem:", error);
    return {
      success: false,
      message: error.message || "Error de red al conectar con Google Sheets.",
    };
  }
};
