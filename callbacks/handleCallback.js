const { Markup } = require("telegraf");
const plays = require("../const/PLAYS");
const { updateUserData, createUserData } = require("../utils/userApi");

module.exports = async function handleCallback(ctx, userStates) {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data;
  const state = userStates.get(userId);

  if (!state) return;
  if (data === "cancel_add_role") {
    userStates.delete(userId);
    return ctx.editMessageText("Добавление роли отменено ✅");
  }

  // Обработка выбора спектакля
  if (data.startsWith("play_")) {
    const playName = data.replace("play_", "");
    if (!plays[playName]) {
      return ctx.answerCbQuery("Спектакль не найден");
    }

    state.selectedPlay = playName;
    state.step = "addCharacter_role";

    const roles = plays[playName];
    const roleButtons = roles.map((role) => [
      Markup.button.callback(role, `role_${role}`),
    ]);
    roleButtons.push([Markup.button.callback("❌ Отмена", "cancel_add_role")]);

    return ctx.editMessageText(
      `Выбери свою роль в спектакле "${playName}":`,
      Markup.inlineKeyboard(roleButtons)
    );
  }

  // Обработка выбора роли
  if (data.startsWith("role_")) {
    const role = data.replace("role_", "");
    const rolesForPlay = plays[state.selectedPlay];

    if (!rolesForPlay || !rolesForPlay.includes(role)) {
      return ctx.answerCbQuery("Роль не найдена");
    }

    const currentCharacters = state.user.characters || [];
    if (currentCharacters.includes(role)) {
      userStates.delete(userId);
      return ctx.editMessageText(
        `У тебя уже есть роль "${role}". Добавление отменено.`
      );
    }

    const updatedCharacters = [...currentCharacters, role];

    await updateUserData(userId, { characters: updatedCharacters });

    userStates.delete(userId);
    return ctx.editMessageText(`✅ Роль "${role}" прикреплена к тебе!`);
  }

  switch (data) {
    case "sex_male":
    case "sex_female":
      state.sex = data === "sex_male" ? "Мужской" : "Женский";
      state.role = "user";

      await ctx.answerCbQuery(); // Убираем "часики"

      await ctx.reply(`Вы выбрали: ${state.sex}`);

      await createUserData(ctx, state, userId, userStates);
      break;

    default:
      await ctx.answerCbQuery("Неизвестное действие ❓");
  }
};
