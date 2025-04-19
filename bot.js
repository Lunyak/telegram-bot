require("dotenv").config();
const { Telegraf } = require("telegraf");
const { getUserData } = require("./utils/userApi");

const bot = new Telegraf(process.env.BOT_TOKEN);

const registerHandler = require("./handlers/registerUserHandler");
const editHandler = require("./handlers/editHandler");
const messageHandler = require("./handlers/messageHandler");
const hendlerCharacters = require("./handlers/charactersHendler");
const handleCallback = require("./callbacks/handleCallback");
const removeCharacterHandler = require("./handlers/removeCharacter");

const userStates = new Map();

// Регистрация обработчиков команд
bot.start((ctx) => {
  ctx.reply(
    `Привет, ${ctx.from.first_name}! Я помогу тебе с напоминаниями и репетициями 🎭`
  );
});

bot.command("register", (ctx) => registerHandler(ctx, userStates));
bot.command("edit", (ctx) => editHandler(ctx, userStates));
bot.command("addrole", (ctx) => hendlerCharacters(ctx, userStates));
bot.command("addRole", (ctx) => hendlerCharacters(ctx, userStates));

// Обработчик для удаления роли
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

    console.log("User data received:", user);

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

// Специальный обработчик callback-запросов для удаления ролей
bot.action(/^remove_character_(.+)$/, async (ctx) => {
  console.log("Handling remove_character callback");
  const userId = ctx.from.id;
  const state = userStates.get(userId);

  if (!state) {
    return ctx.answerCbQuery("Сессия устарела. Начните заново.");
  }

  // Передаем управление обработчику удаления ролей
  await removeCharacterHandler(ctx, userStates);
});

// Обработчик для отмены удаления роли
bot.action("cancel_remove", async (ctx) => {
  console.log("Handling cancel_remove callback");
  const userId = ctx.from.id;

  // Передаем управление обработчику удаления ролей
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

  // Для остальных callback вызываем общий обработчик
  await handleCallback(ctx, userStates);
});

bot.on("text", (ctx) => messageHandler(ctx, userStates));

// Регистрация команд
try {
  bot.telegram
    .setMyCommands([
      { command: "start", description: "Запустить бота" },
      { command: "register", description: "Зарегистрироваться" },
      { command: "edit", description: "Редактировать профиль" },
      { command: "addrole", description: "Добавить роль" },
      { command: "removerole", description: "Удалить роль" },
    ])
    .then(() => {
      console.log("Команды бота успешно установлены");
    });
} catch (error) {
  console.error("Ошибка при настройке команд:", error);
}

// Запуск бота
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
