const actionHandlers = require("./callbacks");
const { getGuestsApi, addGuest } = require("./googleSheets");
const messageEvents = require("./massegeEvents");

class GoogleSheetsService {
  constructor(bot, userStates) {
    this.bot = bot;
    this.userStates = userStates;
  }

  async startGetList(ctx) {
    const userId = ctx.from.id;

    // Set initial state
    this.userStates.set(userId, {
      step: "getlist_select_play", // Changed step name
    });

    // Send play selection keyboard
    const keyboard = {
      inline_keyboard: [
        [
          { text: "Васса Железнова", callback_data: "getlist_Васса_Железнова" },
          {
            text: "Куличевское заклятие",
            callback_data: "getlist_Куличевское_заклятие",
          },
        ],
      ],
    };

    await ctx.reply("Выберите спектакль:", { reply_markup: keyboard });
  }

  async getList(ctx, play) {
    try {
      // Determine sheet name based on selected play
      const sheetName =
        play === "Васса_Железнова" ? "Васса 08.05.25" : "Дураки 02.05.25";

      // Get data from the sheet
      const guestsData = await getGuestsApi(sheetName);

      // Store the data in user state
      this.userStates.set("googlSheets", {
        currentPage: 0,
        guestsData: guestsData,
      });

      // Send first page
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

  // Инициализация команды /addguest
  initGuestCommands(ctx) {
    const userId = ctx.from.id;

    // Устанавливаем состояние для выбора спектакля
    this.userStates.set(userId, {
      step: "addguest_select_play", // Changed step name
      data: {},
    });

    // Отправляем список спектаклей
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "Васса Железнова",
            callback_data: "addguest_Васса_Железнова",
          },
          {
            text: "Куличевское заклятие",
            callback_data: "addguest_Куличевское_заклятие",
          },
        ],
      ],
    };

    ctx.reply("Выберите спектакль для добавления гостя:", {
      reply_markup: keyboard,
    });
  }

  async addGuestHendler(ctx, state, userId) {
    const guestData = [
      state.data.name, // Гость
      state.data.pass, // Проходка
      state.data.from, // От кого
      state.data.note, // Примечание
    ];

    // Определяем лист в зависимости от выбранного спектакля
    const sheetName =
      state.play === "Васса_Железнова" ? "Васса 08.05.25" : "Дураки 02.05.25";

    // Записываем данные в Google Таблицу
    addGuest(guestData, sheetName).then((success) => {
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
