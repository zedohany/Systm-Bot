const User = require("../models/User");

module.exports = {
  name: 'balance',
  description: 'View your current balance or someone elses balance using ID or Mention',
  async execute(message) {
    try {
      // الحصول على Mention أو ID من الرسالة
      const mentionedUser = message.mentions.users.first();
      const userId = mentionedUser ? mentionedUser.id : (message.content.split(' ')[1] || message.author.id);

      // البحث عن المستخدم في قاعدة البيانات
      const user = await User.findOne({ userId: userId });

      if (!user) {
        console.log(`User not found for ${userId}`);
        return message.reply("❌ هذا المستخدم ليس لديه حساب بعد! استخدم `!daily` أولاً.");
      }

      // الرد بالرصيد
      if (mentionedUser) {
        message.reply(`💰 رصيد المستخدم ${mentionedUser.tag} الحالي: **${user.balance}** عملة.`);
      } else if (userId === message.author.id) {
        message.reply(`💰 رصيدك الحالي: **${user.balance}** عملة.`);
      } else {
        message.reply(`💰 رصيد المستخدم صاحب الـ ID ${userId} الحالي: **${user.balance}** عملة.`);
      }

    } catch (error) {
      console.error(error);
      message.reply("❌ حدث خطأ أثناء جلب البيانات.");
    }
  },
};