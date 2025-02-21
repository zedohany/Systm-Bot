const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const User = require("../models/User");

module.exports = {
  name: "daily", 
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("احصل على مكافأتك اليومية!"),

  async execute(interactionOrMessage) {
    const userId = interactionOrMessage.user 
      ? interactionOrMessage.user.id  
      : interactionOrMessage.author.id; 

    const username = interactionOrMessage.user 
      ? interactionOrMessage.user.username  
      : interactionOrMessage.author.username;

    let user = await User.findOne({ userId });

    const randomReward = Math.floor(Math.random() * 500) + 1; 

    if (!user) {
      user = new User({
        userId,
        username,
        balance: randomReward,
        lastDaily: new Date(),
      });
    } else {
      const now = new Date();
      if (now - user.lastDaily < 24 * 60 * 60 * 1000) {
        return interactionOrMessage.reply({
          content: "❌ لقد حصلت بالفعل على مكافأتك اليوم!",
          flags: MessageFlags.Ephemeral, // ✅ Fixes the deprecation warning
        });
      }
      user.balance += randomReward;
      user.lastDaily = now;
    }

    await user.save();

    const response = `✅ حصلت على **${randomReward}** عملة! رصيدك الآن: **${user.balance}** 💰`;

    if (interactionOrMessage.reply) {
      await interactionOrMessage.reply(response);
    } else {
      await interactionOrMessage.channel.send(response);
    }
  },
};