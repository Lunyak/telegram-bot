const axios = require("axios");
const { Markup } = require("telegraf");

module.exports = async (ctx, userStates) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);

  // Обработка callback query для выбора роли
  if (ctx.callbackQuery) {
    const data = ctx.callbackQuery.data;

    if (data === "cancel_remove") {
      await ctx.editMessageText("Удаление роли отменено ✅");
      userStates.delete(userId);
      return;
    }

    if (data.startsWith("remove_character_")) {
      const characterToRemove = data.replace("remove_character_", "");
      const userRoles = state?.user.characters || [];
      const updatedRoles = userRoles.filter(
        (role) => role !== characterToRemove
      );

      try {
        await updateUserData(state.user.id, {
          characters: updatedRoles,
        });

        await ctx.editMessageText(
          `🗑 Роль "${characterToRemove}" удалена успешно!`
        );
      } catch (err) {
        console.error(err.response?.data || err.message);
        await ctx.editMessageText("Ошибка при удалении роли.");
      }

      userStates.delete(userId);
      return;
    }
  }

  // Первый запуск: отображаем роли
  const characters = state?.user.characters || [];

  if (characters.length === 0) {
    return ctx.reply("У тебя нет ролей, которые можно удалить.");
  }

  userStates.set(userId, {
    step: "removeCharacter_select",
    user: state?.user || {},
  });

  // Создаем инлайн клавиатуру с ролями
  const inlineKeyboard = [
    ...characters.map((character) => [
      Markup.button.callback(character, `remove_character_${character}`),
    ]),
    [Markup.button.callback("Отмена", "cancel_remove")],
  ];

  return ctx.reply(
    "Выбери роль, которую хочешь удалить:",
    Markup.inlineKeyboard(inlineKeyboard)
  );
};
