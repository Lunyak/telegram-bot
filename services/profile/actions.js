const editProfileHandler = require("./handlers/editProfileHandler");
const roleHendlers = require("./handlers/roleHendler");

module.exports = (bot, userStates) => {
  bot.action("change_profile", async (ctx) => {
    editProfileHandler.start(ctx);
  });

  // Обработчик для кнопки "Изменить имя"
  bot.action("change_profile_name", async (ctx) => {
    await editProfileHandler.setChangeState(ctx, userStates, "name");
  });

  // Обработчик для кнопки "Изменить email"
  bot.action("change_profile_email", async (ctx) => {
    await editProfileHandler.setChangeState(ctx, userStates, "email");
  });

  // Обработчик для кнопки "Изменить пароль"
  bot.action("change_profile_password", async (ctx) => {
    await editProfileHandler.setChangeState(ctx, userStates, "password");
  });

  // Обработчик для кнопки "Изменить день рождения"
  bot.action("change_profile_birthday", async (ctx) => {
    await editProfileHandler.setChangeState(ctx, userStates, "birthday");
  });

  bot.action("profile_roles", async (ctx) => {
    roleHendlers.myRoles(ctx, userStates);
  });

  bot.action("profile_role_add", async (ctx) => {
    roleHendlers.addRole(ctx, userStates);
  });

  // удаление роли ервый шаг
  bot.action("profile_role_remove", async (ctx) => {
    roleHendlers.removeRoleScene(ctx, userStates);
  });
  bot.action("back_to_profile", async (ctx) => {
    roleHendlers.backToProfile(ctx, userStates);
  });

  // закрыть профайл
  bot.action("close_profile", async (ctx) => {
    roleHendlers.closeProfile(ctx, userStates);
  });

  bot.action(/^play_(.+)$/, (ctx) => {
    const playTitle = ctx.match[1];
    return roleHendlers.handlePlaySelection(ctx, userStates, playTitle);
  });

  // Обработка выбора персонажа
  bot.action(/^character_(.+)$/, (ctx) => {
    const character = ctx.match[1];

    return roleHendlers.handleCharacterSelection(ctx, userStates, character);
  });

  // удалени ролей
  bot.action(/^removecharacter_(.+)$/, (ctx) => {
    const character = ctx.match[1];
    console.log(character);

    return roleHendlers.removeRole(ctx, userStates, character);
  });

  // Обработка возврата к выбору спектаклей
  bot.action("back_to_plays", (ctx) => {
    return roleHendlers.backToPlays(ctx, userStates);
  });

  // Обработка возврата к выбору персонажей
  bot.action(/^back_to_characters_(.+)$/, (ctx) => {
    const playTitle = ctx.match[1];
    return roleHendlers.backToCharacters(ctx, userStates, playTitle);
  });

  // Обработка отмены добавления роли
  bot.action("cancel_add_role", (ctx) => {
    return roleHendlers.cancelAddRole(ctx, userStates);
  });
};
