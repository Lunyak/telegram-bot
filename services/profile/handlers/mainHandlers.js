const { Markup } = require("telegraf");
const { getUserData } = require("../../../api/userApi");
const { formatProfileMessage } = require("../../../utils/formatters");
const ButtonsProfile = require("../buttons/buttons");

/**
 * Обработчик команды просмотра профиля
 * @param {Object} ctx - Контекст Telegraf
 * @param {Map} userStates - Карта состояний пользователей
 */
module.exports = async (ctx, userStates) => {
  const userId = ctx.from.id;

  if (!userStates.get(userId)) {
    try {
      // Получаем данные пользователя
      const user = await getUserData(userId).catch((err) => {
        console.error("Error fetching user data:", err);
        throw new Error("Не удалось загрузить данные пользователя.");
      });

      userStates.set(userId, { step: "", user });

      if (!user) {
        return ctx.reply(
          "Не удалось найти данные вашего профиля. Сначала зарегистрируйтесь с помощью команды /register."
        );
      }
    } catch (err) {
      console.log("ошибка получения данных пользователя");
    }
  }
  // Форматируем данные профиля в читаемый вид
  const profileMessage = formatProfileMessage(userStates.get(userId).user);

  // Проверяем, является ли чат групповым
  const isGroup = ctx.chat.type === "group" || ctx.chat.type === "supergroup";

  if (isGroup) {
    // В группе отправляем только подтверждение и переходим в личку
    await ctx.reply(
      `${ctx.from.first_name}, я отправил информацию о вашем профиле в личные сообщения.`
    );

    // Отправляем полную информацию в личные сообщения
    try {
      await ctx.telegram.sendMessage(userId, profileMessage, {
        parse_mode: "HTML",
        ...ButtonsProfile.ButtonsInitProfile,
      });
    } catch (error) {
      console.error("Error sending private message:", error);
      await ctx.reply(
        "Не удалось отправить сообщение в личку. Пожалуйста, сначала начните диалог с ботом."
      );
    }
  } else {
    // В личном чате просто отправляем информацию
    await ctx.reply(profileMessage, {
      parse_mode: "HTML",
      ...ButtonsProfile.ButtonsInitProfile,
    });
  }
};
