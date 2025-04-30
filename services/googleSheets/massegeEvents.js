const messageEvents = (bot) => {
  bot.bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const state = bot.userStates.get(userId);

    if (!state) {
      return;
    }

    // Шаг выбора спектакля
    if (state.step === "select_play") {
      const play = ctx.message.text;

      // Проверяем, что выбранный спектакль существует
      const plays = ["Васса Железнова", "Куличевское заклятие"];
      if (!plays.includes(play)) {
        await ctx.reply("Пожалуйста, выберите спектакль из списка.");
        return;
      }

      // Сохраняем выбранный спектакль в состоянии
      state.play = play;
      state.step = "addGuest_name";
      bot.userStates.set(userId, state);

      await ctx.reply("Введите имя гостя:");
      return;
    }

    // Остальная логика добавления гостя
    if (state.step === "addguest_name") {
      state.data.name = ctx.message.text;
      state.step = "addguest_pass";
      bot.userStates.set(userId, state);
      await ctx.reply("Введите проходка или билет:");
    } else if (state.step === "addguest_pass") {
      state.data.pass = ctx.message.text;
      state.step = "addguest_from";
      bot.userStates.set(userId, state);
      await ctx.reply("Укажите, от кого гость:");
    } else if (state.step === "addguest_from") {
      state.data.from = ctx.message.text;
      state.step = "addguest_note";
      bot.userStates.set(userId, state);
      await ctx.reply("Добавьте примечание или оставьте пустым:");
    } else if (state.step === "addguest_note") {
      state.data.note = ctx.message.text;

      bot.addGuestHendler(ctx, state, userId);
    }
  });
};

module.exports = messageEvents;
