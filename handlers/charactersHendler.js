const axios = require("axios");
const { Markup } = require("telegraf");
const plays = require("../const/PLAYS");
const API_BASE_URL = require("../const/API_BASE_URL");

module.exports = async (ctx, userStates) => {
  const userId = ctx.from.id;

  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/users/telegram/${userId}`
    );

    userStates.set(userId, {
      step: "addCharacter_play",
      user: data,
    });

    // Create inline keyboard with plays
    const buttons = Object.keys(plays).map((title) => [
      Markup.button.callback(title, `play_${title}`),
    ]);

    // Add cancel button
    buttons.push([Markup.button.callback("❌ Отмена", "cancel_add_role")]);

    await ctx.reply("Выбери спектакль:", Markup.inlineKeyboard(buttons));
  } catch (err) {
    console.error(err.message);
    await ctx.reply(
      "Ты ещё не зарегистрирован.",
      Markup.inlineKeyboard([
        [Markup.button.callback("Регистрация", "register")],
      ])
    );
  }
};

module.exports.plays = plays;
