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
 * Класс управления ботом
 * Структурирует управление функционалом бота
 */
class BotManager {
  constructor(bot) {
    this.bot = bot;
    this.userStates = new Map();
    this.birthdayService = new BirthdayService(bot);
  }

  /**
   * Инициализация бота
   */
  init() {
    this._setupBasicCommands();
    this._setupProfileCommands();
    this._setupRoleManagement();
    this._setupCallbackHandlers();
    this._setupMessageHandlers();
    this._registerBotCommands();
    this._initServices();
    this._startBot();
  }

  /**
   * Настройка базовых команд
   */
  _setupBasicCommands() {
    this.bot.start((ctx) => {
      ctx.reply(
        `Привет, ${ctx.from.first_name}! Я помогу тебе с напоминаниями и репетициями 🎭`
      );
    });
  }

  /**
   * Настройка команд профиля и регистрации
   */
  _setupProfileCommands() {
    this.bot.command(["profile", "me"], (ctx) =>
      profileHandler(ctx, this.userStates)
    );
    this.bot.command("register", (ctx) =>
      registerHandler(ctx, this.userStates)
    );
    this.bot.command("edit", (ctx) => editHandler(ctx, this.userStates));

    this.bot.command("checkbirthdays", async (ctx) => {
      if (ctx.from.id === parseInt(process.env.ADMIN_ID)) {
        await ctx.reply("Запускаю проверку дней рождения...");
        await this.birthdayService.manualCheck();
        await ctx.reply("Проверка завершена!");
      }
    });
  }

  /**
   * Настройка команд управления ролями
   */
  _setupRoleManagement() {
    // Добавление ролей
    this.bot.command(["addrole", "addRole"], (ctx) =>
      hendlerCharacters(ctx, this.userStates)
    );

    // Удаление ролей
    this.bot.command(["removerole", "removeRole"], async (ctx) => {
      console.log("Received remove role command from:", ctx.from.id);

      try {
        const user = await getUserData(ctx.from.id).catch((err) => {
          console.error("Error fetching user data:", err);
          throw new Error("Не удалось загрузить данные пользователя.");
        });

        if (!user) {
          return ctx.reply(
            "Не удалось найти данные вашего профиля. Сначала зарегистрируйтесь с помощью команды /register."
          );
        }

        this.userStates.set(ctx.from.id, {
          step: "removeCharacter_select",
          user,
        });

        await removeCharacterHandler(ctx, this.userStates);
      } catch (error) {
        console.error("Error handling remove role command:", error);
        await ctx.reply(
          `Произошла ошибка: ${
            error.message || "Неизвестная ошибка"
          }. Пожалуйста, попробуйте позже.`
        );
      }
    });
  }

  /**
   * Настройка обработчиков callback-запросов
   */
  _setupCallbackHandlers() {
    // Обработчики callback-запросов для профиля
    this.bot.action("my_roles", (ctx) =>
      profileCallbacks.myRoles(ctx, this.userStates)
    );
    this.bot.action("back_to_profile", (ctx) =>
      profileCallbacks.backToProfile(ctx, this.userStates)
    );
    this.bot.action("add_role", (ctx) =>
      profileCallbacks.addRole(ctx, this.userStates)
    );
    this.bot.action("remove_role", (ctx) =>
      profileCallbacks.removeRole(ctx, this.userStates)
    );
    this.bot.action("close_profile", (ctx) =>
      profileCallbacks.closeProfile(ctx, this.userStates)
    );

    // Специальные обработчики для удаления ролей
    this.bot.action(/^remove_character_(.+)$/, async (ctx) => {
      console.log("Handling remove_character callback");
      const userId = ctx.from.id;
      const state = this.userStates.get(userId);

      if (!state) {
        return ctx.answerCbQuery("Сессия устарела. Начните заново.");
      }

      await removeCharacterHandler(ctx, this.userStates);
    });

    this.bot.action("cancel_remove", async (ctx) => {
      console.log("Handling cancel_remove callback");
      await removeCharacterHandler(ctx, this.userStates);
    });

    // Общий обработчик для остальных callback-запросов
    this.bot.on("callback_query", async (ctx) => {
      const data = ctx.callbackQuery.data;

      // Пропускаем обработку, если это callback для удаления роли
      if (data.startsWith("remove_character_") || data === "cancel_remove") {
        console.log("Skipping general handler for:", data);
        return;
      }

      await handleCallback(ctx, this.userStates);
    });
  }

  /**
   * Настройка обработчиков сообщений
   */
  _setupMessageHandlers() {
    this.bot.on("text", (ctx) => messageHandler(ctx, this.userStates));
  }

  /**
   * Регистрация команд в меню бота
   */
  _registerBotCommands() {
    try {
      this.bot.telegram
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
  }

  /**
   * Инициализация служб бота
   */
  _initServices() {
    this.birthdayService.init();
  }

  /**
   * Запуск бота
   */
  _startBot() {
    this.bot
      .launch()
      .then(() => {
        console.log("Бот запущен ✅");
      })
      .catch((err) => {
        console.error("Ошибка запуска бота:", err);
      });

    // Включаем graceful stop
    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }
}

// Создаем и инициализируем менеджер бота
const botManager = new BotManager(bot);
botManager.init();
