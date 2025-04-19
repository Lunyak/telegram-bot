const createUser = require("../api/users/createUser");

module.exports = async function handleCallback(ctx, userStates) {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data;
  const state = userStates.get(userId);
  const { Markup } = require("telegraf");
  const plays = require("../const/plays");
  const updateUsers = require("../api/users/updateUsers");

  if (!state) return;
  if (data === "cancel_add_role") {
    userStates.delete(userId);
    return ctx.editMessageText("Добавление роли отменено ✅");
  }
  switch (data) {
    case "addCharacter_play":
      if (!data.startsWith("play_")) return;

      const playName = data.replace("play_", "");
      if (!plays[playName]) return;

      state.selectedPlay = playName;
      state.step = "addCharacter_role";

      const roles = plays[playName];
      const roleButtons = roles.map((role) => [
        Markup.button.callback(role, `role_${role}`),
      ]);
      roleButtons.push([
        Markup.button.callback("❌ Отмена", "cancel_add_role"),
      ]);

      return ctx.editMessageText(
        `Выбери свою роль в спектакле "${playName}":`,
        Markup.inlineKeyboard(roleButtons)
      );

    case "addCharacter_role":
      if (!data.startsWith("role_")) return;

      const role = data.replace("role_", "");
      const rolesForPlay = plays[state.selectedPlay];

      if (!rolesForPlay.includes(role)) return;

      const currentCharacters = state.user.characters || [];
      if (currentCharacters.includes(role)) {
        userStates.delete(userId);
        return ctx.editMessageText(
          `У тебя уже есть роль "${role}". Добавление отменено.`
        );
      }

      const updatedCharacters = [...currentCharacters, role];
      await updateUsers(ctx, userId, updatedCharacters);

      userStates.delete(userId);
      return ctx.editMessageText(`✅ Роль "${role}" прикреплена к тебе!`);

    case "sex_male":
    case "sex_female":
      state.sex = data === "sex_male" ? "Мужской" : "Женский";
      state.role = "user";

      await ctx.answerCbQuery(); // Убираем "часики"

      await ctx.reply(`Вы выбрали: ${state.sex}`);

      await createUser(ctx, state, userId, userStates);
      break;

    default:
      await ctx.answerCbQuery("Неизвестное действие ❓");
  }
};
