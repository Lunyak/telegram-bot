require("dotenv").config();
const { Telegraf } = require("telegraf");

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Импорт обработчиков команд
const ProfileService = require("./services/profile/ProfileService");

/**
 * Класс управления ботом
 * Структурирует управление функционалом бота
 */
class BotManager {
  constructor(bot) {
    this.bot = bot;
    this.userStates = new Map();
    this.profile = new ProfileService(this.bot, this.userStates);
    // this.birthdayService = new BirthdayService(bot);
    this.callbackHandlers = require("./handlers/callbackHandlers");
    this.commandHandlers = require("./handlers/commandHendlers");
  }

  /**
   * Инициализация бота
   */
  init() {
    this._setupStartCommand();
    this._setupCommands();
    // this._setupRoleManagement();
    this._setupMessageHandlers();
    this._registerBotCommands();
    this._initServices();
    this._startBot();
  }

  /**
   * Настройка базовых команд
   */
  _setupStartCommand() {
    this.bot.start((ctx) => {
      ctx.reply(
        `Привет, ${ctx.from.first_name}! Я помогу тебе с напоминаниями и репетициями 🎭`
      );
    });
  }

  _setupCommands() {
    this.bot.command(["profile", "me"], (ctx) => {
      this.profile.initMainProfileHendler(ctx, this.userStates);
    });
    this.bot.command("register", (ctx) =>
      this.profile.registerUser(ctx, this.userStates)
    );
    this.bot.command("addguestvassa", (ctx) =>
      this.profile.initGuestCommands(ctx, this.userStates)
    );
  }
  /**
   * Настройка команд профиля и регистрации
   */
  // _setupProfileCommands() {

  //   this.bot.command("checkbirthdays", async (ctx) => {
  //     if (ctx.from.id === parseInt(process.env.ADMIN_ID)) {
  //       await ctx.reply("Запускаю проверку дней рождения...");
  //       await this.birthdayService.manualCheck();
  //       await ctx.reply("Проверка завершена!");
  //     }
  //   });
  // }

  /**
   * Настройка обработчиков сообщений
   */
  _setupMessageHandlers() {}

  /**
   * Регистрация команд в меню бота
   */
  _registerBotCommands() {
    this.commandHandlers.init(this.bot);
  }

  /**
   * Инициализация служб бота
   */
  _initServices() {
    // this.birthdayService.init();
    this.profile.init();
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
