const axios = require("axios");

module.exports = {
  getUserData: async (userId) => {
    const { data } = await axios.get(
      `http://localhost:3000/users/telegram/${userId}`
    );
    return data;
  },
  updateUserData: async (userId, data) => {
    await axios.patch(`http://localhost:3000/users/telegram/${userId}`, data);
  },
  createUserData: async (userData) => {
    await axios.post("http://localhost:3000/users", userData);
  },
};
