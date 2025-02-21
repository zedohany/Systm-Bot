const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "ping", // للأوامر العادية (Prefix Commands)
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("اختبار البوت ومعرفة استجابته"),

  async execute(interactionOrMessage, args) {
    if (interactionOrMessage.reply) {
      // تنفيذ الأمر كنظام Slash Command
      await interactionOrMessage.reply("🏓 Pong!");
    } else {
      // تنفيذ الأمر كنظام Prefix Command
      await interactionOrMessage.channel.send("🏓 Pong!");
    }
  },
};