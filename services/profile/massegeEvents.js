const messageEvents = (bot) => {
  bot.bot.on("text", (ctx) => {
    const userId = ctx.from.id;
    const state = bot.userStates.get(userId);
    console.log(state);
    if (!state) {
      return;
    }

    // обработка теста при редактировании пользователя
    if (state?.step?.startsWith("change_profile")) {
      bot.changeFieldProfile(ctx, state);
    }

    if (state.step === "addGuest_name") {
      console.log("ADD_GEST_NAME");

      state.data.name = ctx.message.text;
      state.step = "addGuest_pass";
      bot.userStates.set(userId, state);
      ctx.reply("Введите проходка или билет:");
    } else if (state.step === "addGuest_pass") {
      state.data.pass = ctx.message.text;
      state.step = "addGuest_from";
      bot.userStates.set(userId, state);
      ctx.reply("Укажите, от кого гость:");
    } else if (state.step === "addGuest_from") {
      state.data.from = ctx.message.text;
      state.step = "addGuest_note";
      bot.userStates.set(userId, state);
      ctx.reply("Добавьте примечание или оставьет пустым:");
    } else if (state.step === "addGuest_note") {
      state.data.note = ctx.message.text;
      bot.addGuestHendler(ctx, state, userId);
    }

    // пошаговая регистрация пользователя
    // Динамический обработчик для регистрации
    if (state?.step?.startsWith("registerUser_")) {
      const field = state.step.split("_")[1]; // Получаем имя поля из step
      bot.saveUserData(ctx, state, field);
      return;
    }
  });
};

module.exports = messageEvents;
