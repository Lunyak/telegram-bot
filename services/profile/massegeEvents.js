const messageEvents = (parent) => {
  parent.bot.on("text", (ctx) => {
    const userId = ctx.from.id;
    const state = parent.userStates.get(userId);

    console.log(ctx?.message?.text);

    // обработка теста при редактировании пользователя
    if (state?.step?.startsWith("change_profile")) {
      parent.changeFieldProfile(ctx, state);
    }

    // пошаговая регистрация пользователя
    // Динамический обработчик для регистрации
    if (state?.step?.startsWith("registerUser_")) {
      console.log('registerUser_');
      
      const field = state.step.split("_")[1]; // Получаем имя поля из step
      parent.saveUserData(ctx, state, field);
      return;
    }
  });
};

module.exports = messageEvents;
