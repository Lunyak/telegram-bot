const actionHandlers = (service) => {
  // Обработчик для кнопок навигации
  service.bot.action(/page_(\d+)/, async (ctx) => {
    const page = parseInt(ctx.match[1]); // Получаем номер страницы
    currentPage = page;
    await service.sendPage(ctx, currentPage);
  });

  // Handle get list play selection
  service.bot.action(/^getlist_(.+)$/, async (ctx) => {
    const play = ctx.match[1];
    await service.getList(ctx, play);
  });

  // Handle add guest play selection
  service.bot.action(/^addguest_(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const play = ctx.match[1];

    // Update state with selected play
    const state = service.userStates.get(userId);
    state.play = play;
    state.step = "addguest_name"; // Next step

    service.userStates.set(userId, state);

    ctx.reply("Введите имя гостя:");
  });

  // ... other action handlers ...
};

module.exports = actionHandlers;
