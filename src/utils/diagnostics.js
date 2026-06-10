import { GOOGLE_SHEETS_API_URL, IS_DEMO_MODE } from "../config";

/**
 * Realiza diagnósticos completos del sistema
 */
export const runDiagnostics = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    mode: IS_DEMO_MODE ? "DEMO" : "REAL",
    googleSheetsUrl: GOOGLE_SHEETS_API_URL,
    tests: {},
  };

  // Test 1: Verificar que la URL está configurada
  results.tests.urlConfigured = {
    name: "URL configurada",
    status: GOOGLE_SHEETS_API_URL ? "PASS" : "FAIL",
    details: GOOGLE_SHEETS_API_URL
      ? `URL: ${GOOGLE_SHEETS_API_URL.substring(0, 50)}...`
      : "No hay URL configurada",
  };

  if (!GOOGLE_SHEETS_API_URL) {
    results.tests.urlConfigured.details =
      "Falta configurar GOOGLE_SHEETS_API_URL en src/config.js";
    return results;
  }

  // Test 2: Verificar conectividad básica (GET request)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(`${GOOGLE_SHEETS_API_URL}?action=read`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    results.tests.connectivity = {
      name: "Conectividad con Google Sheets",
      status: response.ok ? "PASS" : "FAIL",
      statusCode: response.status,
      statusText: response.statusText,
    };

    if (response.ok) {
      try {
        const data = await response.json();
        results.tests.connectivity.dataRetrieved = true;
        results.tests.connectivity.itemsCount = Array.isArray(data)
          ? data.length
          : 0;
        results.tests.connectivity.sampleData =
          Array.isArray(data) && data.length > 0 ? data[0] : null;
      } catch (parseError) {
        results.tests.connectivity.status = "PARTIAL";
        results.tests.connectivity.details = "Respuesta no es JSON válido";
      }
    } else {
      results.tests.connectivity.details = `Error HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error) {
    results.tests.connectivity = {
      name: "Conectividad con Google Sheets",
      status: "FAIL",
      error: error.name,
      message: error.message,
    };

    if (error.name === "AbortError") {
      results.tests.connectivity.details =
        "Timeout: El servidor tardó más de 10 segundos en responder";
    } else if (error.message.includes("Failed to fetch")) {
      results.tests.connectivity.details =
        "Error CORS o problema de red. Verifica que la URL es correcta y tiene acceso público.";
    }
  }

  // Test 3: Verificar modo demo
  results.tests.modeCheck = {
    name: "Modo de operación",
    status: "INFO",
    mode: IS_DEMO_MODE
      ? "DEMO (usando localStorage)"
      : "REAL (usando Google Sheets)",
    explanation: IS_DEMO_MODE
      ? "Los datos se guardan localmente en el navegador. Los cambios NO se guardan en Google Sheets."
      : "Los datos se sincronizan con Google Sheets.",
  };

  // Test 4: Verificar estructura esperada
  if (results.tests.connectivity?.sampleData) {
    const expectedColumns = [
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
      "Inventariado",
    ];
    const hasAllColumns = expectedColumns.every(
      (col) => col in results.tests.connectivity.sampleData,
    );

    results.tests.dataStructure = {
      name: "Estructura de datos",
      status: hasAllColumns ? "PASS" : "WARNING",
      expectedColumns: expectedColumns,
      actualColumns: Object.keys(results.tests.connectivity.sampleData || {}),
      message: hasAllColumns
        ? "Estructura correcta"
        : "Faltan algunas columnas esperadas",
    };
  }

  return results;
};

/**
 * Formatea los resultados de diagnóstico para mostrar en la UI
 */
export const formatDiagnosticsReport = (results) => {
  let report = `
╔════════════════════════════════════════════════════════════════╗
║           REPORTE DE DIAGNÓSTICO DEL SISTEMA                  ║
╚════════════════════════════════════════════════════════════════╝

📅 Timestamp: ${results.timestamp}
🔄 Modo: ${results.mode}

`;

  if (results.googleSheetsUrl) {
    report += `🔗 URL Google Apps Script: ${results.googleSheetsUrl}\n\n`;
  }

  report += "═══ PRUEBAS ═══\n\n";

  Object.entries(results.tests).forEach(([key, test]) => {
    const statusIcon =
      test.status === "PASS"
        ? "✅"
        : test.status === "FAIL"
          ? "❌"
          : test.status === "WARNING"
            ? "⚠️"
            : "ℹ️";

    report += `${statusIcon} ${test.name}\n`;
    report += `   Estado: ${test.status}\n`;

    if (test.details) report += `   Detalles: ${test.details}\n`;
    if (test.statusCode) report += `   Código HTTP: ${test.statusCode}\n`;
    if (test.error) report += `   Error: ${test.error}\n`;
    if (test.message) report += `   Mensaje: ${test.message}\n`;
    if (test.itemsCount !== undefined)
      report += `   Items recuperados: ${test.itemsCount}\n`;
    if (test.mode) report += `   Modo: ${test.mode}\n`;
    if (test.explanation) report += `   Explicación: ${test.explanation}\n`;

    report += "\n";
  });

  return report;
};

/**
 * Genera recomendaciones basadas en los resultados
 */
export const generateRecommendations = (results) => {
  const recommendations = [];

  if (IS_DEMO_MODE) {
    recommendations.push({
      type: "warning",
      title: "Modo Demo Activo",
      message:
        "Los datos se guardan localmente. Para guardar en Google Sheets, configura GOOGLE_SHEETS_API_URL en src/config.js",
      action: "Implementar Google Apps Script",
    });
  }

  if (results.tests.connectivity?.status === "FAIL") {
    recommendations.push({
      type: "error",
      title: "Error de Conectividad",
      message:
        results.tests.connectivity.message ||
        results.tests.connectivity.details,
      action:
        'Verifica que: 1) La URL sea correcta, 2) Google Apps Script esté deployado, 3) Tenga acceso "Cualquiera"',
    });
  }

  if (
    results.tests.connectivity?.statusCode === 401 ||
    results.tests.connectivity?.statusCode === 403
  ) {
    recommendations.push({
      type: "error",
      title: "Error de Autenticación/Permisos",
      message:
        "El Google Apps Script requiere permisos o no está accesible públicamente.",
      action:
        "Re-implementa el script con: Ejecutar como: Tu cuenta | Quién tiene acceso: Cualquiera",
    });
  }

  if (
    results.tests.modeCheck?.status === "INFO" &&
    !IS_DEMO_MODE &&
    !results.tests.connectivity?.dataRetrieved
  ) {
    recommendations.push({
      type: "error",
      title: "No se pueden sincronizar datos",
      message: "La conexión a Google Sheets no funciona correctamente.",
      action: "Verifica el Google Apps Script y redeploya si es necesario",
    });
  }

  return recommendations;
};
