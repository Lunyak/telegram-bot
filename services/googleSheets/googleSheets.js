const { google } = require("googleapis");
const sheets = google.sheets("v4");
const SERVICE_ACCOUNT_KEY = require("../../rare-responder-296712-0f68fa892908.json");

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
async function addGuest(guestData) {
  try {
    const auth = await authorize();
    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = process.env.SPREADSHEET_ID; // Убедитесь, что это правильный ID

    // Используйте правильное имя листа
    const sheetName = "Васса 08.05.25"; // Имя листа в таблице

    // Убедитесь, что диапазон указан правильно
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

module.exports = { addGuest };
