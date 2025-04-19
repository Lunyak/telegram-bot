// 📁 steps/registrationSteps.js
const { Markup } = require("telegraf");
const { createUserData } = require("../utils/userApi");

module.exports = async function handleRegistrationStep(
  ctx,
  state,
  text,
  userStates
) {
  const userId = ctx.from.id;

  switch (state.step) {
    case "name":
      state.name = text;
      state.step = "surname";
      return ctx.reply("Фамилия?");

    case "surname":
      state.surname = text;
      state.step = "email";
      return ctx.reply("Email:");

    case "email":
      state.email = text;
      state.step = "birthday";
      return ctx.reply("Дата рождения DDMMYYYY");

    case "birthday":
      state.birthday = text;
      state.step = "phone";
      return ctx.reply("Номер телефона +7 000 000 00 00");

    case "phone":
      state.phone = text;
      state.step = "sex";
      return ctx.reply(
        "Выбери пол:",
        Markup.inlineKeyboard([
          [Markup.button.callback("Мужской", "sex_male")],
          [Markup.button.callback("Женский", "sex_female")],
        ])
      );

    case "sex_male":
      if (text !== "Мужской" && text !== "Женский") {
        return ctx.reply("Пожалуйста, выбери пол с кнопок");
      }

      state.role = "user";

      await createUserData(ctx, state, userId, userStates);

      break;
  }
};
