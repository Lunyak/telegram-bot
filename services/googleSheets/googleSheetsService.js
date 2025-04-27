const actionHandlers = require("./callbacks");
const { getGuestsApi, addGuest } = require("./googleSheets");
const messageEvents = require("./massegeEvents");

class GoogleSheetsService {
  constructor(bot, userStates) {
    this.bot = bot;
    this.userStates = userStates;
  }

  async getList(ctx) {
    try {
      // Получаем данные из таблицы
      const guestsData = await getGuestsApi();

      this.userStates.set("googlSheets", {
        currentPage: 0,
        guestsData,
      });

      // Отправляем первую страницу
      await this.sendPage(ctx, 0);
    } catch (error) {
      console.log(error);

      ctx.reply("Ошибка при получении данных гостей.");
    }
  }
  async sendPage(ctx, page) {
    const pageSize = 30; // Количество записей на странице
    const state = this.userStates.get("googlSheets");
    const guestsData = state?.guestsData || [];

    const start = page * pageSize;
    const end = start + pageSize;
    const pageData = guestsData.slice(start, end);

    if (pageData.length === 0) {
      await ctx.reply("Нет данных для отображения.");
      return;
    }

    // Формируем заголовок таблицы
    const header =
      `<b>Наполненность зала</b>\n` +
      `<code>----------------------------------------------------</code>`;

    // Формируем строки таблицы
    const rows = pageData
      .map((row, index) => {
        const num = (start + index + 1).toString().padEnd(3); // Номер строки
        const guest = (row[0] || "-").padEnd(0); // Гость
        const pass = (row[1] || "-").padEnd(0); // Проходка
        const from = (row[2] || "-").padEnd(0); // От кого
        const note = (row[3] || "-").padEnd(0); // Примечание
        return `<code>${num} <b>${guest}</b> ${pass} ${from} ${note}</code>`;
      })
      .join("\n");

    // Формируем клавиатуру для навигации
    const keyboard = {
      inline_keyboard: [],
    };

    // Добавляем кнопку "Назад", если это не первая страница
    if (page > 0) {
      keyboard.inline_keyboard.push([
        {
          text: "⬅️ Назад",
          callback_data: `page_${page - 1}`,
        },
      ]);
    }

    // Добавляем кнопку "Вперед", если это не последняя страница
    if (end < guestsData.length) {
      keyboard.inline_keyboard.push([
        {
          text: "Вперед ➡️",
          callback_data: `page_${page + 1}`,
        },
      ]);
    }

    // Отправляем сообщение с клавиатурой
    await ctx.reply(rows, { reply_markup: keyboard, parse_mode: "HTML" });
  }

  // Инициализация команды /addGuest
  initGuestCommands(ctx, userStates) {
    const userId = ctx.from.id;

    // Устанавливаем состояние для сбора данных гостя
    userStates.set(userId, {
      step: "addGuest_name",
      data: {},
    });

    ctx.reply("Введите имя гостя:");
  }

  addGuestHendler(ctx, state, userId) {
    const guestData = [
      state.data.name, // Гость
      state.data.pass, // Проходка
      state.data.from, // От кого
      state.data.note, // Примечание
    ];

    // Записываем данные в Google Таблицу
    addGuest(guestData).then((success) => {
      if (success) {
        ctx.reply("Гость успешно добавлен в таблицу!");
      } else {
        ctx.reply("Произошла ошибка при добавлении гостя.");
      }
    });

    // Очищаем состояние
    this.userStates.delete(userId);
  }

  initMessageHendlers() {
    const GoogleSheetsMiddleware = messageEvents(this);
    this.bot.use(GoogleSheetsMiddleware);
  }

  init() {
    this.initMessageHendlers();
    actionHandlers(this);
  }
}

module.exports = GoogleSheetsService;
