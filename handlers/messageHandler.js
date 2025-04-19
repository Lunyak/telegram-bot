const handleRegistrationStep = require("../steps/registrationSteps");
const handleEditStep = require("../steps/editSteps");
const handleCharacterStep = require("../steps/characterSteps");

module.exports = async (ctx, userStates) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);
  if (!state) return;

  const text = ctx.message.text;

  const step = state.step;
  if (["name", "surname", "email", "birthday", "phone", "sex"].includes(step)) {
    return handleRegistrationStep(ctx, state, text, userStates);
  }
  if (["edit_select", "edit_value"].includes(step)) {
    return handleEditStep(ctx, state, text, userStates);
  }
  if (["addCharacter_play", "addCharacter_role"].includes(step)) {
    return handleCharacterStep(ctx, state, text, userStates);
  }
  // if (["cancel"].includes(step)) {
  //   userStates.delete(userId);
  //   return ctx.reply("Действие отменено ✅", Markup.removeKeyboard());
  // }

  ctx.reply("Запрос на бек почему-то упал, спросите дядю Сережу почему");
  userStates.delete(userId);
};
