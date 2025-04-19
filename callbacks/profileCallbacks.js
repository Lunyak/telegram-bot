const { Markup } = require("telegraf");
const { getUserData } = require("../utils/userApi");
const { formatProfileMessage } = require("../utils/formatters");

/**
 * Обработчики callback-запросов для профиля
 */
const profileCallbacks = {
  /**
   * Обработчик просмотра ролей
   */
  async myRoles(ctx, userStates) {
    const userId = ctx.from.id;

    try {
      // Получаем данные пользователя
      const user = await getUserData(userId);

      if (!user) {
        return ctx.answerCbQuery("Профиль не найден.");
      }

      const characters = user.characters || [];

      if (characters.length === 0) {
        await ctx.answerCbQuery("У вас нет ролей.");
        return ctx.editMessageText(
          "У вас пока нет ролей. Вы можете добавить роль с помощью команды /addrole.",
          Markup.inlineKeyboard([
            [Markup.button.callback("« Назад", "back_to_profile")],
          ])
        );
      }

      const rolesMessage = `<b>Ваши роли:</b>\n\n${characters
        .map((role, index) => `${index + 1}. ${role}`)
        .join("\n")}`;

      await ctx.editMessageText(rolesMessage, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("➕ Добавить роль", "add_role")],
          [Markup.button.callback("🗑 Удалить роль", "remove_role")],
          [Markup.button.callback("« Назад", "back_to_profile")],
          [Markup.button.callback("❌ Закрыть", "close_profile")], // Добавляем кнопку закрытия
        ]),
      });

      await ctx.answerCbQuery();
    } catch (error) {
      console.error("Error handling my_roles action:", error);
      await ctx.answerCbQuery("Произошла ошибка при загрузке ролей.");
    }
  },

  /**
   * Обработчик возврата к профилю
   */
  async backToProfile(ctx, userStates) {
    const userId = ctx.from.id;

    try {
      const user = await getUserData(userId);

      if (!user) {
        return ctx.answerCbQuery("Профиль не найден.");
      }

      const profileMessage = formatProfileMessage(user);

      await ctx.editMessageText(profileMessage, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("🔄 Обновить данные", "edit_profile")],
          [Markup.button.callback("🎭 Мои роли", "my_roles")],
          [Markup.button.callback("❌ Закрыть", "close_profile")], // Добавляем кнопку закрытия
        ]),
      });

      await ctx.answerCbQuery();
    } catch (error) {
      console.error("Error handling back_to_profile action:", error);
      await ctx.answerCbQuery("Произошла ошибка.");
    }
  },

  /**
   * Обработчик добавления роли
   */
  async addRole(ctx, userStates) {
    await ctx.answerCbQuery("Переход к добавлению роли...");
    await ctx.deleteMessage();

    // Импортируем обработчик добавления роли
    const hendlerCharacters = require("../handlers/charactersHendler");
    await hendlerCharacters(ctx, userStates);
  },

  /**
   * Обработчик удаления роли
   */
  async removeRole(ctx, userStates) {
    await ctx.answerCbQuery("Переход к удалению роли...");
    await ctx.deleteMessage();

    // Получаем данные пользователя
    const userId = ctx.from.id;
    const user = await getUserData(userId);

    userStates.set(userId, {
      step: "removeCharacter_select",
      user,
    });

    // Импортируем обработчик удаления роли
    const removeCharacterHandler = require("../handlers/removeCharacter");
    await removeCharacterHandler(ctx, userStates);
  },

  /**
   * Обработчик закрытия профиля
   */
  async closeProfile(ctx, userStates) {
    const userId = ctx.from.id;

    try {
      // Удаляем сообщение с профилем
      await ctx.deleteMessage();

      // Отвечаем на callback
      await ctx.answerCbQuery("Профиль закрыт");

      // Очищаем состояние, если оно связано с профилем
      const state = userStates.get(userId);
      if (state && state.step && state.step.includes("profile")) {
        userStates.delete(userId);
      }
    } catch (error) {
      console.error("Error closing profile:", error);
      await ctx.answerCbQuery("Не удалось закрыть профиль");
    }
  },
};

module.exports = profileCallbacks;
