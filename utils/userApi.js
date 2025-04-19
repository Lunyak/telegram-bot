const axios = require("axios");
const API_BASE_URL = require("../const/API_BASE_URL");

/**
 * Обновляет данные пользователя по его Telegram ID
 * @param {string|number} telegramId - Telegram ID пользователя
 * @param {Object} userData - Данные для обновления
 * @returns {Promise} - Результат запроса
 */
const updateUserData = async (telegramId, userData) => {
  try {
    console.log(`Updating user with Telegram ID: ${telegramId}`, userData);
    const response = await axios.patch(
      `${API_BASE_URL}/users/telegram/${telegramId}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating user data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Получает данные пользователя по его Telegram ID
 * @param {string|number} userId - Telegram ID пользователя
 * @returns {Promise} - Результат запроса
 */
const getUserData = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/telegram/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error getting user data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Создает нового пользователя
 * @param {Object} userData - Данные пользователя
 * @returns {Promise} - Результат запроса
 */
const createUserData = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating user:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  updateUserData,
  getUserData,
  createUserData,
};
