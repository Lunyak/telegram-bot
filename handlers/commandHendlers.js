module.exports = {
  init: async (bot) => {
    try {
      bot.telegram
        .setMyCommands([
          { command: "start", description: "Запустить бота" },
          { command: "register", description: "Зарегистрироваться" },
          { command: "profile", description: "Просмотреть свой профиль" },
          {
            command: "addguestvassa",
            description: "Добавить зрителя на спектакль Васса Железнова",
          },
          {
            command: "guests",
            description: "Показывает список гостей",
          },
          {
            command: "checkbirthdays",
            description: "Проверить наличие именниников",
          },
        ])
        .then(() => {
          console.log("Команды бота успешно установлены");
        });
    } catch (error) {
      console.error("Ошибка при настройке команд:", error);
    }
  },
};
