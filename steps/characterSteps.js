const { Markup } = require("telegraf");
const plays = require("../const/PLAYS");
const { updateUserData } = require("../utils/userApi");

module.exports = async function handleCharacterStep(
  ctx,
  state,
  text,
  userStates
) {
  const userId = ctx.from.id;

  // Обработка отмены
  if (text.toLowerCase() === "отмена") {
    userStates.delete(userId);
    return ctx.reply("Добавление роли отменено ✅", Markup.removeKeyboard());
  }

  switch (state.step) {
    case "addCharacter_play":
      if (!plays[text]) {
        return ctx.reply(
          "Пожалуйста, выбери спектакль из списка или нажми 'Отмена'."
        );
      }
      state.selectedPlay = text;
      state.step = "addCharacter_role";
      const roles = plays[text];
      return ctx.reply(
        `Выбери свою роль в спектакле "${text}":`,
        Markup.keyboard([...roles.map((role) => [role]), ["Отмена"]])
          .oneTime()
          .resize()
      );

    case "addCharacter_role":
      const rolesForPlay = plays[state.selectedPlay];
      if (!rolesForPlay.includes(text)) {
        return ctx.reply("Выбери роль из списка или нажми 'Отмена'.");
      }

      const currentCharacters = state.user.characters || [];

      // Проверка, есть ли уже такая роль
      if (currentCharacters.includes(text)) {
        userStates.delete(userId); // Очищаем состояние пользователя
        return ctx.reply(
          `У тебя уже есть роль "${text}" в спектакле "${state.selectedPlay}". Операция отменена. ✅`,
          Markup.removeKeyboard()
        );
      }

      const updatedCharacters = [...currentCharacters, text];

      await updateUserData(ctx, userId, updatedCharacters);

      userStates.delete(userId);
      break;
  }
};
