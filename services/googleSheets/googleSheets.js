const { google } = require("googleapis");
const sheets = google.sheets("v4");
const SERVICE_ACCOUNT_KEY = require("../googleSheets/configs/rare-responder-296712-0f68fa892908.json");

// Авторизация через сервисный аккаунт
async function authorize() {
  const authClient = new google.auth.JWT({
    email: SERVICE_ACCOUNT_KEY.client_email,
    key: SERVICE_ACCOUNT_KEY.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  await authClient.authorize();
  return authClient;
}

// Запись данных гостя в Google Таблицу
async function addGuest(guestData, sheetName) {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = `${sheetName}!A:D`; // Диапазон для добавления данных

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: {
        values: [guestData], // Данные гостя
      },
    });

    console.log("Гость успешно добавлен:", response.data);
    return response.data;
  } catch (error) {
    console.error("Ошибка при добавлении гостя:", error);
    throw error;
  }
}

// Получение данных гостей из Google Таблицы
async function getGuestsApi(sheetName = "Лист1") {
  // Установим значение по умолчанию
  try {
    if (!sheetName) {
      throw new Error("Не указано имя листа (sheetName)");
    }

    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = `${sheetName}!A:D`; // Диапазон данных (такой же, как при добавлении)

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || []; // Возвращаем данные или пустой массив
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    throw error;
  }
}

module.exports = { addGuest, getGuestsApi };
