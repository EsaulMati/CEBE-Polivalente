/**
 * Configuración Global del Sistema de Inventario CEBE Polivalente
 *
 * VERSIÓN OFICIAL PARA CLIENTE
 * =============================
 * Esta es la configuración de producción lista para entregar al cliente
 *
 * ⚠️ IMPORTANTE:
 * - Para que FUNCIONE, DEBES seguir los pasos en GUIA_RAPIDA_LOGIN_SYNC.md
 * - Sin la URL de Google Apps Script, el sistema NO sincronizará datos
 */

// 🔗 URL de la aplicación web de Google Apps Script
// INSTRUCCIONES PARA OBTENERLA:
// 1. Abre tu Google Sheet
// 2. Ve a Extensiones > Apps Script
// 3. Borra todo y pega el código de google-apps-script.js
// 4. Guarda (Ctrl+S)
// 5. Implementar > Nueva implementación
// 6. Tipo: "Aplicación web"
// 7. Ejecutar como: Tu cuenta de Google
// 8. Quién tiene acceso: "Cualquiera" ← CRÍTICO (sin esto NO funciona)
// 9. Copia la URL completa (https://script.google.com/macros/s/...XXX.../exec)
// 10. Reemplaza la URL de abajo:
export const GOOGLE_SHEETS_API_URL =
  "https://script.google.com/macros/s/AKfycbwCsCgfxPV3DRG1OF4zxnKM2Zj4KidGG_-Yi18H8VJEiXETmYtgAoCvkAVOdXYLToEd/exec";

// 🔐 MODO OFICIAL
// - false = Conectado a Google Sheets (PRODUCCIÓN - recomendado)
// - true = Modo Demo (solo para desarrollo local, usa datos falsos)
// IMPORTANTE: Para que la app sincronice, esto DEBE ser false
export const IS_DEMO_MODE = false;

// 🔒 Credenciales por defecto (cambia en google-apps-script.js si necesitas otros usuarios)
// Usuario: admin
// Contraseña: admin123
