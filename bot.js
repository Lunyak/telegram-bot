require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const registerHandler = require("./handlers/registerUserHandler");
const editHandler = require("./handlers/editHandler");
const messageHandler = require("./handlers/messageHandler");
const hendlerCharacters = require("./handlers/charactersHendler");
const handleCallback = require("./callbacks/handleCallback");

const userStates = new Map();

bot.start((ctx) => {
  ctx.reply(
    `Привет, ${ctx.from.first_name}! Я помогу тебе с напоминаниями и репетициями 🎭`
  );
});

bot.command("register", (ctx) => registerHandler(ctx, userStates));
bot.command("edit", (ctx) => editHandler(ctx, userStates));
bot.command("addRole", (ctx) => hendlerCharacters(ctx, userStates));
bot.on("text", (ctx) => messageHandler(ctx, userStates));
bot.on("callback_query", (ctx) => handleCallback(ctx, userStates));

bot.command("cancel", (ctx) => {
  userStates.delete(ctx.from.id);
  ctx.reply("Действие отменено ✅", Markup.removeKeyboard());
});
// bot.on("message", (ctx) => {
//   console.log("Новое сообщение в чате:", ctx.message);
// });

bot.command("removeRole", async (ctx) => {
  const user = await getUserByTelegramId(ctx.from.id); // твоя функция

  userStates.set(ctx.from.id, {
    step: "removeCharacter_select",
    user,
  });

  require("./scenes/removeCharacter")(ctx, userStates);
});

bot.launch();
console.log("Бот запущен ✅");
