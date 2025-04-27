const messageEvents = (service) => {
  return (ctx, next) => {
    const userId = ctx.from.id;
    const state = service.userStates.get(userId);

    if (!state) {
      return next();
    }

    if (state.step === "addGuest_name") {
      state.data.name = ctx.message.text;
      state.step = "addGuest_pass";
      service.userStates.set(userId, state);
      ctx.reply("Введите проходка или билет:");
    } else if (state.step === "addGuest_pass") {
      state.data.pass = ctx.message.text;
      state.step = "addGuest_from";
      service.userStates.set(userId, state);
      ctx.reply("Укажите, от кого гость:");
    } else if (state.step === "addGuest_from") {
      state.data.from = ctx.message.text;
      state.step = "addGuest_note";
      service.userStates.set(userId, state);
      ctx.reply("Добавьте примечание или оставьте пустым:");
    } else if (state.step === "addGuest_note") {
      state.data.note = ctx.message.text;
      service.addGuestHendler(ctx, state, userId);
    } else {
      next();
    }
  };
};

module.exports = messageEvents;
