const { SlashCommandBuilder } = require("discord.js");
const User = require("../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Send money to someone else 💰")
    .addUserOption(option =>
      option
        .setName("recipient")
        .setDescription("recipient user")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Amount to be sent")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser("recipient");
      const amount = interaction.options.getInteger("amount");

      if (!targetUser) {
        return interaction.reply({ content: "❌ يجب تحديد مستخدم صالح لإرسال المال إليه!", ephemeral: true });
      }

      if (amount <= 0) {
        return interaction.reply({ content: "❌ المبلغ يجب أن يكون رقمًا موجبًا أكبر من 0!", ephemeral: true });
      }

      if (targetUser.id === interaction.user.id) {
        return interaction.reply({ content: "❌ لا يمكنك إرسال المال لنفسك!", ephemeral: true });
      }

      let sender = await User.findOne({ userId: interaction.user.id });
      let receiver = await User.findOne({ userId: targetUser.id });

      if (!sender || sender.balance < amount) {
        return interaction.reply({ content: "❌ ليس لديك رصيد كافٍ!", ephemeral: true });
      }

      if (!receiver) {
        receiver = new User({ userId: targetUser.id, username: targetUser.username, balance: amount });
      } else {
        receiver.balance += amount;
      }

      sender.balance -= amount;
      await sender.save();
      await receiver.save();

      await interaction.reply(`✅ أرسلت **${amount}** عملة إلى ${targetUser} 💰`);

      try {
        await targetUser.send(`💰 لقد استلمت **${amount}** عملة من ${interaction.user.username}!`);
      } catch (error) {
        console.error("تعذر إرسال الرسالة الخاصة للمستخدم", error);
      }
    } catch (error) {
      console.error(error);
      interaction.reply({ content: "❌ حدث خطأ أثناء تنفيذ العملية.", ephemeral: true });
    }
  },
};
