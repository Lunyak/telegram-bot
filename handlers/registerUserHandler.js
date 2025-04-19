const axios = require("axios");
const API_BASE_URL = require("../const/API_BASE_URL");

module.exports = async (ctx, userStates) => {
  try {
    const resp = await axios.get(
      `${API_BASE_URL}/users/telegram/${ctx.from.id}`
    );

    // Если пользователь найден — сообщаем и выходим
    if (resp.data) {
      ctx.reply("Ты уже зарегистрирован ✅");
      return;
    } else {
      userStates.set(ctx.from.id, { step: "name" });
      return ctx.reply("Как тебя зовут?");
    }
  } catch (err) {
    // Если ошибка — проверим, что это 404 Not Found
    if (err.response && err.response.status === 404) {
      // Пользователь не найден — начинаем регистрацию
    }

    // Если ошибка другая — показываем её
    const message = err?.response?.data?.message;
    ctx.reply(
      `Произошла ошибка при проверке пользователя \n${message || err.message}`
    );
  }
};
