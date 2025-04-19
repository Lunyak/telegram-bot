require("dotenv").config();
const { Telegraf } = require("telegraf");
const { getUserData } = require("./utils/userApi");

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Импорт обработчиков команд
const registerHandler = require("./handlers/registerUserHandler");
const editHandler = require("./handlers/editHandler");
const messageHandler = require("./handlers/messageHandler");
const hendlerCharacters = require("./handlers/charactersHendler");
const handleCallback = require("./callbacks/handleCallback");
const removeCharacterHandler = require("./handlers/removeCharacter");
const profileHandler = require("./handlers/profileHandler");
const profileCallbacks = require("./callbacks/profileCallbacks");
const BirthdayService = require("./services/birthdayService");

// Хранилище состояний пользователей
const userStates = new Map();

/**
 * БАЗОВЫЕ КОМАНДЫ
 */
bot.start((ctx) => {
  console.log(ctx);
  console.log(ctx.message.chat);
  
  ctx.reply(
    `Привет, ${ctx.from.first_name}! Я помогу тебе с напоминаниями и репетициями 🎭`
  );
});

/**
 * ПРОФИЛЬ И РЕГИСТРАЦИЯ
 */
// Инициализация сервиса дней рождения
const birthdayService = new BirthdayService(bot);
birthdayService.init();

bot.command(["profile", "me"], (ctx) => profileHandler(ctx, userStates));
bot.command("register", (ctx) => registerHandler(ctx, userStates));
bot.command("edit", (ctx) => editHandler(ctx, userStates));

bot.command("checkbirthdays", async (ctx) => {
  
  // Можно добавить проверку на админа
  if (ctx.from.id === parseInt(process.env.ADMIN_ID)) {
    await ctx.reply("Запускаю проверку дней рождения...");
    await birthdayService.manualCheck();
    await ctx.reply("Проверка завершена!");
  }
});
/**
 * УПРАВЛЕНИЕ РОЛЯМИ
 */
// Добавление ролей
bot.command(["addrole", "addRole"], (ctx) =>
  hendlerCharacters(ctx, userStates)
);

// Удаление ролей
bot.command(["removerole", "removeRole"], async (ctx) => {
  console.log("Received remove role command from:", ctx.from.id);

  try {
    // Получаем данные пользователя из API
    const user = await getUserData(ctx.from.id).catch((err) => {
      console.error("Error fetching user data:", err);
      throw new Error("Не удалось загрузить данные пользователя.");
    });

    if (!user) {
      return ctx.reply(
        "Не удалось найти данные вашего профиля. Сначала зарегистрируйтесь с помощью команды /register."
      );
    }

    // Сохраняем состояние пользователя
    userStates.set(ctx.from.id, {
      step: "removeCharacter_select",
      user,
    });

    // Вызываем обработчик удаления роли
    await removeCharacterHandler(ctx, userStates);
  } catch (error) {
    console.error("Error handling remove role command:", error);
    await ctx.reply(
      `Произошла ошибка: ${
        error.message || "Неизвестная ошибка"
      }. Пожалуйста, попробуйте позже.`
    );
  }
});

/**
 * ОБРАБОТЧИКИ CALLBACK-ЗАПРОСОВ
 */

// Обработчики callback-запросов для профиля
bot.action("my_roles", (ctx) => profileCallbacks.myRoles(ctx, userStates));
bot.action("back_to_profile", (ctx) =>
  profileCallbacks.backToProfile(ctx, userStates)
);
bot.action("add_role", (ctx) => profileCallbacks.addRole(ctx, userStates));
bot.action("remove_role", (ctx) =>
  profileCallbacks.removeRole(ctx, userStates)
);
bot.action("close_profile", (ctx) =>
  profileCallbacks.closeProfile(ctx, userStates)
);

// Специальные обработчики для удаления ролей
bot.action(/^remove_character_(.+)$/, async (ctx) => {
  console.log("Handling remove_character callback");
  const userId = ctx.from.id;
  const state = userStates.get(userId);

  if (!state) {
    return ctx.answerCbQuery("Сессия устарела. Начните заново.");
  }

  await removeCharacterHandler(ctx, userStates);
});

bot.action("cancel_remove", async (ctx) => {
  console.log("Handling cancel_remove callback");
  await removeCharacterHandler(ctx, userStates);
});

// Общий обработчик для остальных callback-запросов
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  // Пропускаем обработку, если это callback для удаления роли
  if (data.startsWith("remove_character_") || data === "cancel_remove") {
    console.log("Skipping general handler for:", data);
    return;
  }

  await handleCallback(ctx, userStates);
});

/**
 * ОБРАБОТЧИК ТЕКСТОВЫХ СООБЩЕНИЙ
 */
bot.on("text", (ctx) => messageHandler(ctx, userStates));

/**
 * РЕГИСТРАЦИЯ КОМАНД В МЕНЮ БОТА
 */
try {
  bot.telegram
    .setMyCommands([
      { command: "start", description: "Запустить бота" },
      { command: "register", description: "Зарегистрироваться" },
      { command: "edit", description: "Редактировать профиль" },
      { command: "addrole", description: "Добавить роль" },
      { command: "removerole", description: "Удалить роль" },
      { command: "profile", description: "Просмотреть свой профиль" },
    ])
    .then(() => {
      console.log("Команды бота успешно установлены");
    });
} catch (error) {
  console.error("Ошибка при настройке команд:", error);
}

/**
 * ЗАПУСК БОТА
 */
bot
  .launch()
  .then(() => {
    console.log("Бот запущен ✅");
  })
  .catch((err) => {
    console.error("Ошибка запуска бота:", err);
  });

// Включаем graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
