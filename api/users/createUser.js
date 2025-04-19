// 📁 api/createUser.js
const axios = require("axios");
const baseUrl = require("../../const/baseUrl");

module.exports = async function createUser(ctx, state, userId, userStates) {
  try {
    await axios.post(`${baseUrl}/users/telegram`, {
      ...state,
      telegram_id: String(userId),
    });
    ctx.reply("Готово! Ты зарегистрирован 🎉");
    userStates.delete(userId);
  } catch (err) {
    const message = err?.response?.data?.message;
    ctx.reply(`Произошла ошибка при регистрации \n ${message || err.message}`);
    userStates.delete(userId);
  }
};
