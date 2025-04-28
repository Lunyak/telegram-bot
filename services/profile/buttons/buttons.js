const { Markup } = require("telegraf");

const ButtonsProfile = {
  ButtonsBackPlays: Markup.inlineKeyboard([
    [Markup.button.callback("« Назад к спектаклям", "back_to_plays")],
    [Markup.button.callback("❌ Отмена", "cancel_add_role")],
  ]),

  ButtonsInitProfile: Markup.inlineKeyboard([
    [Markup.button.callback("🔄 Обновить данные", "change_profile")],
    [Markup.button.callback("🎭 Мои роли", "profile_roles")],
    [Markup.button.callback("❌ Закрыть", "close_profile")],
  ]),

  ButtonsChangeProfileFields: Markup.inlineKeyboard([
    [Markup.button.callback("Изменить имя", "change_profile_name")],
    [Markup.button.callback("Изменить email", "change_profile_email")],
    [Markup.button.callback("Изменить фамилию", "change_profile_surname")],
    [Markup.button.callback("Изменить пол, мб...", "change_profile_sex")],
    [
      Markup.button.callback(
        "Изменить день рождения",
        "change_profile_birthday"
      ),
    ],
    [Markup.button.callback("« Назад", "back_to_profile")],
  ]),

  ButtonsAddRole: Markup.inlineKeyboard([
    [Markup.button.callback("➕ Добавить роль", "profile_role_add")],
    [Markup.button.callback("🗑 Удалить роль", "profile_role_remove")],
    [Markup.button.callback("« Назад", "back_to_profile")],
  ]),
};

module.exports = ButtonsProfile;
