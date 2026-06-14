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
  CÓDIGO: "Código patrimonial",
  CODIGO: "Código patrimonial",
  "CÓDIGO PATRIMONIAL": "Código patrimonial",
  "CODIGO PATRIMONIAL": "Código patrimonial",
  INVENTARIADO: "Inventariado",
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

  var rowValues = mapRowFromItem(itemData, headers);
  var itemColumnIndex = headers.indexOf("ITEM");
  var emptyRowIndex = -1;

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][itemColumnIndex] || "").trim() === "") {
      emptyRowIndex = i;
      break;
    }
  }

  if (emptyRowIndex !== -1) {
    var targetRange = sheet.getRange(
      info.headerRow + emptyRowIndex,
      1,
      1,
      rowValues.length,
    );
    targetRange.setValues([rowValues]);

    // COPIAR FORMATO (incluyendo desplegables) de la fila superior (encabezados o fila anterior)
    var sourceRange = sheet.getRange(info.headerRow, 1, 1, rowValues.length);
    sourceRange.copyTo(
      targetRange,
      SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,
      false,
    );
  } else {
    var targetRange = sheet.getRange(
      info.headerRow + data.length,
      1,
      1,
      rowValues.length,
    );
    targetRange.setValues([rowValues]);

    // COPIAR FORMATO (incluyendo desplegables) de la fila superior
    var sourceRange = sheet.getRange(
      info.headerRow + data.length - 1,
      1,
      1,
      rowValues.length,
    );
    sourceRange.copyTo(
      targetRange,
      SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,
      false,
    );
  }

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

  var updatedRow = [];
  for (var j = 0; j < headers.length; j++) {
    var appField = FIELD_MAPPING[headers[j]];
    if (appField) {
      updatedRow.push(
        itemData[appField] !== undefined
          ? itemData[appField]
          : normalizeValue(data[rowIndex][j]),
      );
    } else {
      updatedRow.push(normalizeValue(data[rowIndex][j]));
    }
  }

  sheet
    .getRange(info.headerRow + rowIndex, 1, 1, headers.length)
    .setValues([updatedRow]);
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
