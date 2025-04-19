const axios = require("axios");
const { Markup } = require("telegraf");

module.exports = async (ctx, userStates) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  const text = ctx.message.text;

  // ✅ Обработка отмены
  if (text.toLowerCase() === "отмена") {
    userStates.delete(userId);
    return ctx.reply("Удаление роли отменено ✅", Markup.removeKeyboard());
  }

  switch (state?.step) {
    case "removeCharacter_select":
      const userRoles = state.user.characters || [];

      if (!userRoles.includes(text)) {
        return ctx.reply("Пожалуйста, выбери роль из списка или нажми Отмена.");
      }

      const updatedRoles = userRoles.filter((role) => role !== text);

      try {
        await axios.patch(
          `http://localhost:3000/users/telegram/${state.user.id}`,
          {
            characters: updatedRoles,
          }
        );

        ctx.reply(`🗑 Роль "${text}" удалена успешно!`);
      } catch (err) {
        console.error(err.response?.data || err.message);
        ctx.reply("Ошибка при удалении роли.");
      }

      userStates.delete(userId);
      break;

    default:
      // Первый запуск: отображаем роли
      const characters = state?.user.characters || [];

      if (characters.length === 0) {
        return ctx.reply("У тебя нет ролей, которые можно удалить.");
      }

      userStates.set(userId, {
        step: "removeCharacter_select",
        user: state?.user || {},
      });

      return ctx.reply(
        "Выбери роль, которую хочешь удалить:",
        Markup.keyboard([...characters.map((r) => [r]), ["Отмена"]])
          .oneTime()
          .resize()
      );
  }
};
