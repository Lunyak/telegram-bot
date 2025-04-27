
const actionHandlers = (service) => {

  // Обработчик для кнопок навигации
  service.bot.action(/page_(\d+)/, async (ctx) => {
    const page = parseInt(ctx.match[1]); // Получаем номер страницы
    currentPage = page;
    await service.sendPage(ctx, currentPage);
  });
};

module.exports = actionHandlers;