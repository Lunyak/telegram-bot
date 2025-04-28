require("dotenv").config();
const { Telegraf } = require("telegraf");

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Импорт обработчиков команд
const ProfileService = require("./services/profile/ProfileService");
const GoogleSheetsService = require("./services/googleSheets/googleSheetsService");
/**
 * Класс управления ботом
 * Структурирует управление функционалом бота
 */
class BotManager {
  constructor(bot) {
    this.bot = bot;
    this.userStates = new Map();
    this.commandHandlers = require("./handlers/commandHendlers");
    this.googleSheets = new GoogleSheetsService(this.bot, this.userStates);
    this.profile = new ProfileService(this.bot, this.userStates);
    // this.birthdayService = new BirthdayService(bot);
  }

  /**
   * Инициализация бота
   */
  init() {
    this._setupStartCommand();
    this._setupCommands();
    // this._setupRoleManagement();
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
      this.googleSheets.initGuestCommands(ctx, this.userStates)
    );
    this.bot.command("guests", async (ctx) => {
      this.googleSheets.getList(ctx)
    });
  }

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
    // this.googleSheets.init();
    this.profile.init();
    // this.birthdayService.init();
  }

  _initMassegeHendlers() {
    // this.googleSheets.initMessageHendlers();
    this.profile.initMessageHendlers();
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
