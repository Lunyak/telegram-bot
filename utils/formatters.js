/**
 * Форматирует данные пользователя в HTML-сообщение о профиле
 * @param {Object} user - Данные пользователя
 * @returns {string} - HTML-форматированное сообщение
 */
const formatProfileMessage = (user) => {
  const characters = user.characters || [];
  const charactersList =
    characters.length > 0
      ? characters.map((char) => `• ${char}`).join("\n")
      : "Нет ролей";

  return (
    `<b>🎭 Ваш профиль в DOPHAMIN</b>\n\n` +
    `<b>Имя:</b> ${user.name || "Не указано"}\n` +
    `<b>Пол:</b> ${user.sex || "Не указан"}\n` +
    `<b>Телефон:</b> ${user.phone || "Не указан"}\n` +
    `<b>Роли:</b>\n${charactersList}\n\n` +
    `Используйте кнопки ниже для управления профилем.`
  );
};

module.exports = {
  formatProfileMessage,
};
