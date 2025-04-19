const { findBirthdayPeople, calculateAge } = require("../utils/birthdayUtils");

/**
 * Сервис для поздравления пользователей с днем рождения
 */
class BirthdayService {
  constructor(bot) {
    this.bot = bot;
    this.initialized = false;

    // Массив шаблонов поздравлений
    this.birthdayMessages = [
      "🎉 С Днем Рождения, {name}! Желаем творческих успехов и вдохновения! 🎭",
      "🎂 Поздравляем с Днем Рождения, {name}! Пусть каждое выступление будет аплодисментами! 👏",
      "🥳 С Днем Рождения, {name}! Желаем новых интересных ролей и громких оваций! 🎬",
      "🎊 {name}, поздравляем тебя с Днем Рождения! Твой талант достоин самых больших сцен! 🎪",
      "🎈 С Днем Рождения, {name}! Пусть твои творческие замыслы всегда воплощаются в жизнь! ✨",
    ];
  }

  /**
   * Инициализирует сервис
   */
  init() {
    if (this.initialized) return;

    // Устанавливаем ежедневную проверку в 10:00 утра
    this.scheduleCheck();
    this.initialized = true;

    console.log("Birthday service initialized");
  }

  /**
   * Планирует ежедневную проверку дней рождения
   */
  scheduleCheck() {
    // Получаем текущее время
    const now = new Date();

    // Устанавливаем время следующей проверки на 10:00 утра
    let nextCheck = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      10,
      0,
      0
    );

    // Если сейчас уже после 10 утра, переносим на завтра
    if (now > nextCheck) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }

    // Вычисляем задержку в миллисекундах
    const delay = nextCheck.getTime() - now.getTime();

    // Планируем первую проверку
    setTimeout(() => {
      this.checkBirthdays();

      // Устанавливаем регулярную проверку каждые 24 часа
      setInterval(() => this.checkBirthdays(), 24 * 60 * 60 * 1000);
    }, delay);

    console.log(
      `Next birthday check scheduled at ${nextCheck.toLocaleString()}`
    );
  }

  /**
   * Проверяет наличие именинников и отправляет поздравления
   */
  async checkBirthdays() {
    console.log("Checking for birthdays...");

    try {
      const birthdayPeople = await findBirthdayPeople();

      console.log('birthdayPeople', birthdayPeople);
      
      if (birthdayPeople.length === 0) {
        console.log("No birthdays today");
        return;
      }

      console.log(`Found ${birthdayPeople.length} people with birthdays today`);

      // Отправляем поздравления каждому имениннику
      for (const person of birthdayPeople) {
        await this.sendBirthdayWish(person);
      }

      // Если есть групповой чат, отправляем общее уведомление туда
      if (process.env.GROUP_CHAT_ID) {
        await this.sendGroupNotification(birthdayPeople);
      }
    } catch (error) {
      console.error("Error in birthday check:", error);
    }
  }

  /**
   * Отправляет поздравление конкретному пользователю
   * @param {Object} user - Пользователь-именинник
   */
  async sendBirthdayWish(user) {
    console.log(user);
    
    if (!user.telegram_id) {
      console.log(`Cannot send birthday wish to ${user.name}: no Telegram ID`);
      return;
    }

    try {
      // Выбираем случайное поздравление
      const messageTemplate =
        this.birthdayMessages[
          Math.floor(Math.random() * this.birthdayMessages.length)
        ];

      // Подставляем имя в шаблон
      const message = messageTemplate.replace("{name}", user.name);

      // Добавляем возраст если доступен
      const age = calculateAge(user.birthDate);
      const ageMessage = age
        ? `\n\nТебе сегодня исполняется ${age} ${this.getYearWord(age)}! 🎂`
        : "";

      // Отправляем личное поздравление
      await this.bot.telegram.sendMessage(
        user.telegram_id,
        message + ageMessage,
        { parse_mode: "HTML" }
      );

      console.log(`Sent birthday wish to ${user.name} (${user.telegramId})`);
    } catch (error) {
      console.error(`Failed to send birthday wish to ${user.name}:`, error);
    }
  }

  /**
   * Отправляет уведомление о днях рождения в групповой чат
   * @param {Array} birthdayPeople - Список именинников
   */
  async sendGroupNotification(birthdayPeople) {
    try {
      // Формируем сообщение со списком именинников
      const names = birthdayPeople.map((p) => p.name).join(", ");

      let message = `🎉 <b>Сегодня день рождения празднуют:</b> ${names}! 🎂\n\n`;
      message += "Не забудьте поздравить коллег! 🎊";

      // Отправляем в групповой чат
      await this.bot.telegram.sendMessage(process.env.GROUP_CHAT_ID, message, {
        parse_mode: "HTML",
      });

      console.log(`Sent group notification about birthdays`);
    } catch (error) {
      console.error("Failed to send group notification:", error);
    }
  }

  /**
   * Склоняет слово "год" в зависимости от числа
   * @param {number} age - Возраст
   * @returns {string} - Правильно склоненное слово
   */
  getYearWord(age) {
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "лет";
    }

    if (lastDigit === 1) {
      return "год";
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return "года";
    }

    return "лет";
  }

  /**
   * Ручная проверка дней рождения (для тестирования)
   */
  async manualCheck() {
    console.log("Manual birthday check initiated");
    await this.checkBirthdays();
  }
}

module.exports = BirthdayService;
