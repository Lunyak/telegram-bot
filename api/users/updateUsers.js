// 📁 api/createUser.js
const axios = require("axios");
const baseUrl = require("../../const/baseUrl");

module.exports = async function updateUser(ctx, userId, characters) {
  try {
    await axios.patch(`${baseUrl}/users/telegram/${userId}`, {
      characters: characters,
    });
    ctx.reply(`✅ Роль "${characters}" прикреплена к тебе!`);
  } catch (err) {
    const message = err?.response?.data?.message;
    ctx.reply(`Ошибка при сохранении роли \n ${message || err.message}`);
  }
};
