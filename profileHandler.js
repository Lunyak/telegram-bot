// В profileHandler.js после отправки сообщения
// Создаем таймер для автоматического закрытия через 5 минут
const messageId = sentMessage.message_id;
const chatId = sentMessage.chat.id;

// Сохраняем информацию о сообщении в состоянии пользователя
userStates.set(userId, {
  ...state,
  profileMessageInfo: {
    messageId,
    chatId,
    timestamp: Date.now(),
    timeoutId: setTimeout(() => {
      // Пытаемся удалить сообщение через 5 минут
      ctx.telegram.deleteMessage(chatId, messageId).catch(() => {
        // Игнорируем ошибки, если сообщение уже удалено или изменено
      });

      // Очищаем информацию из состояния
      const currentState = userStates.get(userId);
      if (currentState && currentState.profileMessageInfo) {
        delete currentState.profileMessageInfo;
        userStates.set(userId, currentState);
      }
    }, 5 * 60 * 1000), // 5 минут
  },
});

// Не забудьте очищать таймер при закрытии профиля вручную
// В методе closeProfile
const state = userStates.get(userId);
if (state && state.profileMessageInfo && state.profileMessageInfo.timeoutId) {
  clearTimeout(state.profileMessageInfo.timeoutId);
}
