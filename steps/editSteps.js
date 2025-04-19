// 📁 steps/editSteps.js
const axios = require("axios");
const { Markup } = require("telegraf");

module.exports = async function handleEditStep(ctx, state, text, userStates) {
  const userId = ctx.from.id;

  switch (state.step) {
    case "edit_select":
      if (
        !["Имя", "Фамилия", "Email", "Телефон", "Пол", "Роль"].includes(text)
      ) {
        return ctx.reply("Пожалуйста, выбери поле с кнопок");
      }
      state.editField = text;
      state.step = "edit_value";
      return ctx.reply(
        `Введи новое значение для: ${text}`,
        Markup.removeKeyboard()
      );

    case "edit_value":
      const fieldMap = {
        Имя: "name",
        Фамилия: "surname",
        Email: "email",
        Телефон: "phone",
        Пол: "sex",
        Роль: "role",
      };
      const field = fieldMap[state.editField];
      try {
        await axios.patch(`http://localhost:3000/users/${state.user.id}`, {
          [field]: text,
        });
        ctx.reply(`✅ ${state.editField} обновлено!`);
      } catch (err) {
        console.error(err.response?.data || err.message);
        ctx.reply("Ошибка при обновлении");
      }
      userStates.delete(userId);
      break;
  }
};