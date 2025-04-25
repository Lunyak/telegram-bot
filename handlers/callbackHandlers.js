// const profileCallbacks = require("./callbacks/profileCallbacks");
// const removeCharacterHandler = require("./callbacks/removeCharacterHandler");
// const handleCallback = require("../handlers/commandHendlers");


module.exports = {
  init: async (bot, userStates) => {

    console.log('≈≈≈≈ççç≈≈≈≈', bot.profile);
    
    // Используем утилиту для вывода сообщения
   
    // bot.profile.initProfileActions(bot, userStates)
    // // Обработчики callback-запросов для профиля
    // bot.action("my_roles", (ctx) => profileCallbacks.myRoles(ctx, userStates));
    // bot.action("back_to_profile", (ctx) =>
    //   profileCallbacks.backToProfile(ctx, userStates)
    // );
    // bot.action("add_role", (ctx) => profileCallbacks.addRole(ctx, userStates));
    // bot.action("remove_role", (ctx) =>
    //   profileCallbacks.removeRole(ctx, userStates)
    // );
    // bot.action("close_profile", (ctx) =>
    //   profileCallbacks.closeProfile(ctx, userStates)
    // );

    // // Специальные обработчики для удаления ролей
    // bot.action(/^remove_character_(.+)$/, async (ctx) => {
    //   const userId = ctx.from.id;
    //   const state = userStates.get(userId);

    //   if (!state) {
    //     return ctx.answerCbQuery("Сессия устарела. Начните заново.");
    //   }

    //   await removeCharacterHandler(ctx, userStates);
    // });

    // bot.action("cancel_remove", async (ctx) => {
    //   console.log("Handling cancel_remove callback");
    //   await removeCharacterHandler(ctx, userStates);
    // });

    // // Обработчик напоминания
    // bot.action("set_reminder", async (ctx) => {
    //   const userId = ctx.from.id;
    //   const state = userStates.get(userId);

    //   if (!state) {
    //     return ctx.answerCbQuery("Сессия устарела. Начните заново.");
    //   }

    //   // Устанавливаем напоминание
    //   await ctx.reply("Напоминание установлено! 🕒");
    //   logBox(`Пользователь ${userId} установил напоминание.`, {
    //     borderColor: "yellow",
    //   });

    //   // Здесь можно добавить логику для сохранения напоминания в базу данных
    // });

    // // Общий обработчик для остальных callback-запросов
    // bot.on("callback_query", async (ctx) => {
    //   const data = ctx.callbackQuery.data;

    //   // Пропускаем обработку, если это callback для удаления роли
    //   if (data.startsWith("remove_character_") || data === "cancel_remove") {
    //     logBox("Skipping general handler for: 🚀", {
    //       borderColor: "yellow",
    //     });
    //     return;
    //   }

    //   await handleCallback(ctx, userStates);
    // });
  },
};
