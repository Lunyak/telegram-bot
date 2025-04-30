const messageEvents = (service) => {
  return async (ctx, next) => {
    console.log(ctx.message);

    const userId = ctx.from.id;
    const state = service.userStates.get(userId);

    // Обработка теста при редактировании пользователя
    if (state?.step?.startsWith("change_profile")) {
      service.changeFieldProfile(ctx, state);
      return;
    }

    // Пошаговая регистрация пользователя
    if (state?.step?.startsWith("registerUser_")) {
      const field = state.step.split("_")[1]; // Получаем имя поля из step
      service.saveUserData(ctx, state, field);
      return;
    }

    // Передаем управление следующему middleware
    next();
  };
};

module.exports = messageEvents;
