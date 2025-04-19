const axios = require("axios");
const { Markup } = require("telegraf");

module.exports = async (ctx, userStates) => {
  const userId = ctx.from.id;

  try {
    const { data } = await axios.get(
      `http://localhost:3000/users/telegram/${userId}`
    );
    userStates.set(userId, { step: "edit_select", user: data });

    ctx.reply(
      "Что хочешь изменить?",
      Markup.keyboard([
        ["Имя", "Фамилия"],
        ["Email", "Телефон"],
        ["Пол", "Роль"],
      ])
        .oneTime()
        .resize()
    );
  } catch (err) {
    ctx.reply("Ты ещё не зарегистрирован. Напиши /register");
  }
};
