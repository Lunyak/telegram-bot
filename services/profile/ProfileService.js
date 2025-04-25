const {
  getUserData,
  updateUserData,
  createUserData,
} = require("../../api/userApi");
const actions = require("./actions");
const mainHendlers = require("./handlers/mainHendlers");
const massegeEvents = require("./massegeEvents");
const roleHendlers = require("./handlers/roleHendler");

class UserService {
  constructor(bot, userStates) {
    this.bot = bot;
    this.userStates = userStates;
  }

  /**
   * Регистрация пользователя
   * @param {Object} ctx - Контекст Telegraf
   */
  async registerUser(ctx) {
    const userId = ctx.from.id;
    try {
      const user = await this.getUser(userId);
      if (user) {
        return ctx.reply("Вы уже зарегистрированы!");
      }

      // Инициализация состояния для регистрации
      this.userStates.set(userId, {
        step: "registerUser_name", // Устанавливаем первый шаг
        data: {}, // Инициализируем объект для хранения данных
      });
      await ctx.reply("Пожалуйста, введите ваше имя:");
    } catch (error) {
      await this.handleError(ctx, error, "регистрации пользователя");
    }
  }

  initMainProfileHendler(ctx, userStates) {
    mainHendlers(ctx, userStates);
  }

  initRoleProfileHendler(ctx, userStates) {
    roleHendlers(ctx, userStates);
  }

  /**
   * Получение данных пользователя
   * @param {number} userId - ID пользователя
   * @returns {Object} - Данные пользователя
   */
  async getUser(userId) {
    return await getUserData(userId).catch((error) => {
      console.error("Ошибка при получении данных пользователя:", error);
      throw error;
    });
  }

  /**
   * Обновление данных пользователя
   * @param {number} userId - ID пользователя
   * @param {Object} data - Новые данные
   */
  async updateUser(userId, data) {
    return await updateUserData(userId, data).catch((error) => {
      console.error("Ошибка при обновлении данных пользователя:", error);
      throw error;
    });
  }

  async changeFieldProfile(ctx, state) {
    const field = state.step.replace("change_profile_", ""); // Извлекаем поле (name, email, password и т.д.)
    const newValue = ctx.message.text; // Новое значение, введённое пользователем
    const userId = ctx.from.id;

    try {
      // Обновляем данные пользователя
      await updateUserData(userId, { [field]: newValue });

      // Очищаем состояние
      this.userStates.delete(userId);

      // Отправляем подтверждение
      await ctx.reply(`Поле "${field}" успешно изменено на: ${newValue}`);
    } catch (error) {
      await ctx.reply(
        `Произошла ошибка при изменении поля "${field}". Пожалуйста, попробуйте позже.`
      );
      console.error(`Ошибка при изменении поля "${field}":`, error);
    }
  }

  async saveUserData(ctx, state, field) {
    const value = ctx.message.text;
    const userId = ctx.from.id;

    // Сохраняем данные в state
    state.data[field] = value;
    this.userStates.set(userId, state);

    // Определяем следующий шаг
    const nextStep = this.getNextRegistrationStep(state.step);

    if (nextStep) {
      // Переходим на следующий шаг
      state.step = nextStep;
      this.userStates.set(userId, state);
      ctx.reply(this.getStepMessage(nextStep));
    } else {
      // Если шагов больше нет, завершаем регистрацию
      await this.createUser(ctx, state.data);
      this.userStates.delete(userId);
    }
  }

  getNextRegistrationStep(currentStep) {
    const steps = [
      "registerUser_name",
      "registerUser_surname",
      "registerUser_email",
      "registerUser_phone",
      "registerUser_birthday",
    ];
    const currentIndex = steps.indexOf(currentStep);
    return steps[currentIndex + 1];
  }

  getStepMessage(step) {
    const messages = {
      registerUser_name: "Введите ваше имя:",
      registerUser_surname: "Введите вашу фамилию:",
      registerUser_email: "Введите ваш email:",
      registerUser_phone: "Введите ваш телефон:",
      registerUser_birthday: "Введите вашу дату рождения (ДД.ММ.ГГГГ):",
    };
    return messages[step];
  }

  async createUser(ctx, userData) {
    try {
      // Здесь вызываем ваш метод для создания пользователя
      // Например:

      //  case "sex_male":
      // if (text !== "Мужской" && text !== "Женский") {
      //   return ctx.reply("Пожалуйста, выбери пол с кнопок");
      // }

      console.log(userData);

      // state.role = "user";

      await createUserData(ctx, state, userId, userStates);
      // await createUserData(userData)
      // const user = await User.create(userData);
      ctx.reply("Регистрация успешно завершена!");
    } catch (error) {
      console.error("Ошибка при создании пользователя:", error);
      ctx.reply("Произошла ошибка при регистрации. Попробуйте снова.");
    }
  }

  init() {
    actions(this.bot, this.userStates);
    massegeEvents(this);
  }
}

module.exports = UserService;
