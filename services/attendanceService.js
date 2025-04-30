const cron = require("node-cron");

class AttendanceService {
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Инициализирует сервис
   */
  init() {
    // Планируем задачу на каждый вторник и пятницу в 12:00
    cron.schedule("0 12 * * 2,5", () => this.sendAttendanceMessage(), {
      timezone: "Europe/Moscow", // Укажите вашу временную зону
    });

    console.log("Сервис переклички инициализирован.");
  }

  /**
   * Отправляет сообщение в группу
   */
  async sendAttendanceMessage() {
    try {
      // Формируем сообщение
      const message = "Проголосуйте кто придет сегодня ✅ ❌";

      // Отправляем сообщение в тему "Перекличка"
      await this.bot.telegram.sendMessage(process.env.GROUP_CHAT_ID, message, {
        message_thread_id: 41051,
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("Ошибка при отправке сообщения переклички:", error);
    }
  }

  /**
   * Ручная отправка сообщения переклички (для тестирования)
   */
  async manualSendAttendanceMessage(ctx) {
    try {
      await this.sendAttendanceMessage();
    } catch (error) {
      console.error("Ошибка при ручной отправке сообщения:", error);
      await ctx.reply("Произошла ошибка при отправке сообщения.");
    }
  }
}

module.exports = AttendanceService;
