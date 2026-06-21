/**
 * SISTEMA DE INVENTARIO ESCOLAR CEBE POLIVALENTE
 * Google Apps Script - Conexión de Google Sheets con la aplicación React
 *
 * Instrucciones de instalación:
 * 1. Abre tu hoja de Google Sheets.
 * 2. Ve a Extensiones > Apps Script.
 * 3. Borra el código existente y pega este archivo completo.
 * 4. Guarda el proyecto (clic en el ícono de disquete).
 * 5. Haz clic en "Implementar" (Deploy) > "Nueva implementación" (New deployment).
 * 6. Selecciona "Tipo de implementación" > "Aplicación web" (Web app).
 * 7. Configura:
 *    - Descripción: Inventario CEBE Polivalente
 *    - Ejecutar como: Tú (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquiera" (Anyone) -> IMPORTANTE para permitir el acceso desde la app.
 * 8. Haz clic en "Implementar", autoriza los permisos si te los solicita, y copia la "URL de la aplicación web".
 * 9. Pega esa URL en el archivo `src/config.js` de la aplicación web React.
 */

var DEFAULT_HEADERS = [
  "ITEM",
  "PRODUCTO",
  "ÁREA",
  "DESCRIPCIÓN",
  "ALTO (cm)",
  "ANCHO (cm)",
  "LARGO (cm)",
  "MARCA",
  "OBSERVACIÓN",
  "ESTADO",
  "CODIGO",
  "INVENTARIADO",
];

var FIELD_MAPPING = {
  ITEM: "Item",
  PRODUCTO: "Producto",
  ÁREA: "Área",
  AREA: "Área",
  UBICACIÓN: "Área",
  UBICACION: "Área",
  DESCRIPCIÓN: "Descripción",
  DESCRIPCION: "Descripción",
  ALTO: "Alto",
  "ALTO (CM)": "Alto",
  ANCHO: "Ancho",
  "ANCHO (CM)": "Ancho",
  LARGO: "Largo",
  "LARGO (CM)": "Largo",
  MARCA: "Marca",
  OBSERVACIÓN: "Observación",
  OBSERVACION: "Observación",
  ESTADO: "Estado",
  "ESTADO FÍSICO": "Estado",
  "ESTADO FISICO": "Estado",
  "ESTADO DEL BIEN": "EstadoBien",
  "ESTADO BIEN": "EstadoBien",
  "ALTA/BAJA": "AltaBaja",
  "ALTA BAJA": "AltaBaja",
  CÓDIGO: "Código patrimonial",
  CODIGO: "Código patrimonial",
  "CÓDIGO PATRIMONIAL": "Código patrimonial",
  "CODIGO PATRIMONIAL": "Código patrimonial",
  INVENTARIADO: "Inventariado",
  BI: "Inventariado",
};

var COL_ALTA_BAJA = 56;
var COL_BH = 60;
var COL_BI = 61;
var FONT_FAMILY = "Arial Narrow";
var FONT_SIZE = 9;
var VALIDATION_SI_NO = ["SI", "NO"];
var VALIDATION_ESTADO_BIEN = ["1", "2", "3", "4", "5"];
var VALIDATION_ALTA_BAJA = ["ALTA", "BAJA"];
var ESTADO_FISICO_MAP = {
  "5": "NUEVO",
  "1": "BUENO",
  "2": "REGULAR",
  "3": "MALO",
  "4": "MUY MALO",
};

var AUTH_TTL_SECONDS = 30 * 60; // 30 minutos

var CREDENTIALS = {
  USERS: {
    admin: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
  },
};

function hashPassword(password) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password.toString(),
  );
  return bytes
    .map(function (b) {
      var byte = b < 0 ? b + 256 : b;
      return ("0" + byte.toString(16)).slice(-2);
    })
    .join("");
}

function generateToken(username) {
  var randomString =
    Utilities.getUuid() + "|" + username + "|" + new Date().getTime();
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    randomString,
  );
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/, "");
}

function verifyToken(token) {
  if (!token) {
    return null;
  }
  return CacheService.getScriptCache().get(token);
}

function requireAuth(token) {
  var username = verifyToken(token);
  if (!username) {
    return {
      success: false,
      message: "Acceso no autorizado. Inicia sesión nuevamente.",
    };
  }
  return { success: true, user: username };
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function normalizeValue(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
    );
  }
  return value === undefined || value === null ? "" : value.toString().trim();
}

function buildDropdownRule(values) {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .setHelpText("Selecciona uno de los valores permitidos.");
}

function getColumnIndexByHeader(headers, names, fallbackPosition) {
  for (var i = 0; i < names.length; i++) {
    var index = headers.indexOf(names[i]);
    if (index !== -1) {
      return index;
    }
  }
  if (
    fallbackPosition !== undefined &&
    fallbackPosition >= 1 &&
    fallbackPosition <= headers.length
  ) {
    return fallbackPosition - 1;
  }
  return -1;
}

function getDistinctColumnValues(data, index) {
  var values = {};
  for (var i = 1; i < data.length; i++) {
    var value = normalizeValue(data[i][index]);
    if (value !== "") {
      values[value] = true;
    }
  }
  return Object.keys(values).sort();
}

function setItemDataValues(sheet, rowIndex, headers, itemData) {
  for (var j = 0; j < headers.length; j++) {
    var appField = FIELD_MAPPING[headers[j]];
    if (appField && itemData[appField] !== undefined) {
      sheet.getRange(rowIndex, j + 1).setValue(normalizeValue(itemData[appField]));
    }
  }
}

function applyValidationsToRow(sheet, rowIndex, headers, info) {
  var altaBajaIndex = getColumnIndexByHeader(headers, ["ALTA/BAJA", "ALTA BAJA"], COL_ALTA_BAJA);
  if (altaBajaIndex !== -1) {
    sheet
      .getRange(rowIndex, altaBajaIndex + 1)
      .setDataValidation(buildDropdownRule(VALIDATION_ALTA_BAJA));
  }

  var estadoBienIndex = getColumnIndexByHeader(headers, ["ESTADO DEL BIEN", "ESTADO BIEN"], null);
  if (estadoBienIndex !== -1) {
    sheet
      .getRange(rowIndex, estadoBienIndex + 1)
      .setDataValidation(buildDropdownRule(VALIDATION_ESTADO_BIEN));
  }

  var inventariadoIndex = getColumnIndexByHeader(headers, ["INVENTARIADO", "BI"], COL_BI);
  if (inventariadoIndex !== -1) {
    sheet
      .getRange(rowIndex, inventariadoIndex + 1)
      .setDataValidation(buildDropdownRule(VALIDATION_SI_NO));
  }

  var areaIndex = getColumnIndexByHeader(headers, ["ÁREA", "AREA", "UBICACIÓN", "UBICACION"], null);
  if (areaIndex !== -1) {
    var areaValues = getDistinctColumnValues(info.data, areaIndex);
    if (areaValues.length > 0) {
      sheet
        .getRange(rowIndex, areaIndex + 1)
        .setDataValidation(buildDropdownRule(areaValues));
    }
  }
}

function copyRowTemplate(sheet, sourceRowIndex, targetRowIndex, numCols) {
  if (sourceRowIndex < 1 || targetRowIndex < 1 || sourceRowIndex === targetRowIndex) {
    return;
  }
  var sourceRange = sheet.getRange(sourceRowIndex, 1, 1, numCols);
  var targetRange = sheet.getRange(targetRowIndex, 1, 1, numCols);

  sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
  sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
  sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_CONDITIONAL_FORMATTING, false);
}

function findHeaderRow(sheet) {
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var lastCol = Math.max(sheet.getLastColumn(), DEFAULT_HEADERS.length);
  var maxRows = Math.min(lastRow, 10);
  var values = sheet.getRange(1, 1, maxRows, lastCol).getValues();

  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    var matches = 0;
    for (var c = 0; c < row.length; c++) {
      var key = row[c].toString().trim().toUpperCase();
      if (FIELD_MAPPING[key]) {
        matches += 1;
      }
    }
    if (matches >= 8) {
      return {
        headerRow: r + 1,
        headers: row.map(function (cell) {
          return cell.toString().trim().toUpperCase();
        }),
      };
    }
  }

  var fallbackRow = values[0] || [];
  return {
    headerRow: 1,
    headers: fallbackRow.map(function (cell) {
      return cell.toString().trim().toUpperCase();
    }),
  };
}

function getSheetData() {
  var sheet = getSheet();
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var lastCol = Math.max(sheet.getLastColumn(), DEFAULT_HEADERS.length);

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, DEFAULT_HEADERS.length)
      .setValues([DEFAULT_HEADERS]);
    lastRow = 1;
  }

  var headerInfo = findHeaderRow(sheet);
  var numRows = Math.max(1, lastRow - headerInfo.headerRow + 1);
  var values = sheet
    .getRange(headerInfo.headerRow, 1, numRows, lastCol)
    .getValues();

  return {
    sheet: sheet,
    headerRow: headerInfo.headerRow,
    headers: headerInfo.headers,
    data: values,
    lastCol: lastCol,
  };
}

function findRowIndex(data, headers, itemCode) {
  var itemIndex = headers.indexOf("ITEM");
  if (itemIndex === -1) {
    return -1;
  }

  for (var i = 1; i < data.length; i++) {
    if (
      String(data[i][itemIndex] || "")
        .trim()
        .toLowerCase() ===
      String(itemCode || "")
        .trim()
        .toLowerCase()
    ) {
      return i;
    }
  }
  return -1;
}

function mapRowFromItem(itemData, headers) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var appField = FIELD_MAPPING[headers[i]];
    if (appField) {
      row.push(itemData[appField] !== undefined ? itemData[appField] : "");
    } else {
      row.push("");
    }
  }
  return row;
}

function doGet(e) {
  var token = e.parameter && e.parameter.token;
  var auth = requireAuth(token);
  if (!auth.success) {
    return createJsonResponse(auth);
  }
  return readInventory();
}

function doPost(e) {
  var result = { success: false, message: "" };
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var data = postData.data;

    if (action !== "login") {
      var auth = requireAuth(data && data.token);
      if (!auth.success) {
        return createJsonResponse(auth);
      }
    }

    if (action === "add") {
      result = addItem(data);
    } else if (action === "update") {
      result = updateItem(data);
    } else if (action === "delete") {
      result = deleteItem(data.item);
    } else if (action === "login") {
      result = handleLogin(data);
    } else {
      result.message = "Acción no soportada.";
    }
  } catch (err) {
    result.message = "Error en el servidor de Google Sheets: " + err.toString();
  }

  return createJsonResponse(result);
}

function handleLogin(credentials) {
  try {
    var username = (credentials.username || "").toString().trim();
    var password = (credentials.password || "").toString();

    if (!username || !password) {
      return {
        success: false,
        message: "Usuario y contraseña son requeridos.",
      };
    }

    var hashedPassword = hashPassword(password);
    if (
      CREDENTIALS.USERS.hasOwnProperty(username) &&
      CREDENTIALS.USERS[username] === hashedPassword
    ) {
      var token = generateToken(username);
      CacheService.getScriptCache().put(token, username, AUTH_TTL_SECONDS);
      return {
        success: true,
        message: "Inicio de sesión correcto.",
        user: username,
        token: token,
        expiresIn: AUTH_TTL_SECONDS,
      };
    }

    Logger.log(
      "Intento de login fallido - Usuario: " +
        username +
        " - Hora: " +
        new Date(),
    );
    return { success: false, message: "Usuario o contraseña incorrectos." };
  } catch (err) {
    return {
      success: false,
      message: "Error al validar credenciales: " + err.toString(),
    };
  }
}

function readInventory() {
  try {
    var info = getSheetData();
    var rows = [];
    var headers = info.headers;

    for (var i = 1; i < info.data.length; i++) {
      var row = info.data[i];
      var item = {};
      var isEmpty = true;

      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        var appField = FIELD_MAPPING[header];
        if (!appField) {
          continue;
        }

        var value = normalizeValue(row[j]);
        item[appField] = value;
        if (value !== "") {
          isEmpty = false;
        }
      }

      if (!isEmpty) {
        rows.push(item);
      }
    }

    return createJsonResponse(rows);
  } catch (err) {
    return createJsonResponse({
      error: true,
      message: "Error al leer inventario: " + err.toString(),
    });
  }
}

function addItem(itemData) {
  var info = getSheetData();
  var sheet = info.sheet;
  var headers = info.headers;
  var data = info.data;

  if (headers.indexOf("ITEM") === -1) {
    return {
      success: false,
      message: "No se encontró la columna 'Item' en el Excel.",
    };
  }

  var newItemCode = (itemData["Item"] || "").toString().trim();
  if (!newItemCode) {
    return { success: false, message: "El campo Item es obligatorio." };
  }

  var existingIndex = findRowIndex(data, headers, newItemCode);
  if (existingIndex !== -1) {
    return { success: false, message: "El código de Item ya existe." };
  }

  var itemColumnIndex = headers.indexOf("ITEM");
  var emptyRowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][itemColumnIndex] || "").trim() === "") {
      emptyRowIndex = i;
      break;
    }
  }

  var targetRow = emptyRowIndex !== -1 ? info.headerRow + emptyRowIndex : info.headerRow + data.length;
  var sourceRow = targetRow - 1;
  if (sourceRow < info.headerRow) {
    sourceRow = info.headerRow;
  }

  copyRowTemplate(sheet, sourceRow, targetRow, headers.length);

  var targetRange = sheet.getRange(targetRow, 1, 1, headers.length);
  targetRange.setFontFamily(FONT_FAMILY).setFontSize(FONT_SIZE);
  setItemDataValues(sheet, targetRow, headers, itemData);

  var bhIndex = getColumnIndexByHeader(headers, ["BH"], COL_BH);
  if (bhIndex !== -1) {
    sheet.getRange(targetRow, bhIndex + 1).clearContent();
  }

  applyValidationsToRow(sheet, targetRow, headers, info);

  return { success: true, message: "Ítem agregado con éxito." };
}

function updateItem(itemData) {
  var info = getSheetData();
  var sheet = info.sheet;
  var headers = info.headers;
  var data = info.data;

  if (headers.indexOf("ITEM") === -1) {
    return {
      success: false,
      message: "No se encontró la columna 'Item' en el Excel.",
    };
  }

  var itemCode = (itemData["Item"] || "").toString().trim();
  var rowIndex = findRowIndex(data, headers, itemCode);
  if (rowIndex === -1) {
    return { success: false, message: "No se encontró el ítem." };
  }

  var targetRow = info.headerRow + rowIndex;
  var targetRange = sheet.getRange(targetRow, 1, 1, headers.length);
  targetRange.setFontFamily(FONT_FAMILY).setFontSize(FONT_SIZE);
  setItemDataValues(sheet, targetRow, headers, itemData);

  var bhIndex = getColumnIndexByHeader(headers, ["BH"], COL_BH);
  if (bhIndex !== -1) {
    sheet.getRange(targetRow, bhIndex + 1).clearContent();
  }

  applyValidationsToRow(sheet, targetRow, headers, info);

  return { success: true, message: "Ítem actualizado con éxito." };
}

function deleteItem(itemCode) {
  var info = getSheetData();
  var sheet = info.sheet;
  var headers = info.headers;
  var data = info.data;

  if (headers.indexOf("ITEM") === -1) {
    return {
      success: false,
      message: "No se encontró la columna 'Item' en el Excel.",
    };
  }

  var rowIndex = findRowIndex(data, headers, itemCode);
  if (rowIndex === -1) {
    return { success: false, message: "No se encontró el ítem." };
  }

  sheet.deleteRow(info.headerRow + rowIndex);
  return { success: true, message: "Ítem eliminado con éxito." };
}
