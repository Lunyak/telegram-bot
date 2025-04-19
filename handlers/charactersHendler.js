const axios = require("axios");
const { Markup } = require("telegraf");
const plays = require("../const/plays");

module.exports = async (ctx, userStates) => {
  const userId = ctx.from.id;

  try {
    const { data } = await axios.get(
      `http://localhost:3000/users/telegram/${userId}`
    );

    userStates.set(userId, {
      step: "addCharacter_play",
      user: data,
    });

    const buttons = Object.keys(plays).map((title) => [
      Markup.button.callback(title, `play_${title}`),
    ]);

    buttons.push([Markup.button.callback("❌ Отмена", "cancel_add_role")]);

    await ctx.reply("Выбери спектакль:", Markup.inlineKeyboard(buttons));
  } catch (err) {
    console.error(err.message);
    ctx.reply("Ты ещё не зарегистрирован. Напиши /register");
  }
};

module.exports.plays = plays;
