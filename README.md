# 🏫 SISTEMA DE INVENTARIO ESCOLAR CEBE POLIVALENTE

**Versión Oficial v1.0** | **Estado: ✅ Listo para Producción**

---

## 📚 DOCUMENTACIÓN PRINCIPAL

### Para clientes nuevos, comience por:

1. **[README_OFICIAL.md](./README_OFICIAL.md)** ← Descripción del sistema
2. **[INSTALACION_CLIENTE.md](./INSTALACION_CLIENTE.md)** ← Guía paso a paso
3. **[CHECKLIST_ENTREGA.md](./CHECKLIST_ENTREGA.md)** ← Verificación final

---

## 🚀 INICIO RÁPIDO (para desarrolladores)

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en desarrollo
npm run dev

# 3. Build para producción
npm run build

# 4. Preview de producción
npm run preview
```

---

## 📋 ESTRUCTURA DEL PROYECTO

```
├── src/
│   ├── components/          # Componentes React
│   ├── utils/               # Funciones auxiliares
│   ├── hooks/               # Custom React hooks
│   ├── config.js            # Configuración (⚠️ IMPORTANTE)
│   └── App.jsx
├── google-apps-script.js    # Script de Google Sheets
├── README_OFICIAL.md        # Documentación oficial
├── INSTALACION_CLIENTE.md   # Guía de instalación
├── CHECKLIST_ENTREGA.md     # Verificación pre-entrega
├── package.json
└── vite.config.js
```

---

## ⚙️ CONFIGURACIÓN REQUERIDA

**Archivo:** `src/config.js`

```javascript
// Paso 1: Pega tu URL de Google Apps Script
export const GOOGLE_SHEETS_API_URL =
  "https://script.google.com/macros/s/tu-url-aqui/exec";

// Paso 2: Asegúrate que está en false (NUNCA true en producción)
export const IS_DEMO_MODE = false;
```

**¿Cómo obtener la URL?** Ver: [INSTALACION_CLIENTE.md](./INSTALACION_CLIENTE.md)

---

## ✨ CARACTERÍSTICAS

- ✅ Login seguro con credenciales en Google Apps Script
- ✅ CRUD completo: Crear, leer, actualizar, eliminar bienes
- ✅ Sincronización bidireccional con Google Sheets
- ✅ Búsqueda y filtros avanzados
- ✅ Exportación a Excel
- ✅ Panel de control con estadísticas
- ✅ Modo oscuro/claro
- ✅ Herramienta de diagnóstico de conexión
- ✅ Interfaz responsive

---

## 🔐 CREDENCIALES POR DEFECTO

```
Usuario: admin
Contraseña: admin123
```

**⚠️ Cambiar antes de entregar al cliente:** Ver [INSTALACION_CLIENTE.md#cambiar-contraseña](./INSTALACION_CLIENTE.md#cambiar-contraseña-opcional)

---

## 📱 REQUISITOS

### Para usar la app

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet
- Cuenta de Google

### Para instalar

- Node.js v16+
- npm o yarn
- Editor de código (VS Code recomendado)

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### ❌ "No se conecta con Google Sheets"

→ Ver [README_OFICIAL.md#troubleshooting](./README_OFICIAL.md#troubleshooting)

### ❌ "Modo Demo Activo"

→ Abre `src/config.js` y verifica que `IS_DEMO_MODE = false`

### ❌ "Error de login"

→ Usuario y contraseña son incorrectos, usa: `admin` / `admin123`

---

## 📞 SOPORTE

Para problemas detallados, consulta:

- [INSTALACION_CLIENTE.md#troubleshooting](./INSTALACION_CLIENTE.md#troubleshooting)
- [README_OFICIAL.md](./README_OFICIAL.md)

---

## 📦 BUILD Y DEPLOY

```bash
# Build para producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

---

## 📄 LICENCIA

Desarrollado para CEBE Polivalente - Todos los derechos reservados.

---

**Versión:** 1.0 | **Fecha:** 9 de junio de 2026 | **Estado:** ✅ Listo para Producción
