const User = require("../models/User");

module.exports = {
  name: "level",
  description: "عرض مستواك الحالي",
  async execute(message) {
    try {
      // العثور على المستخدم في قاعدة البيانات
      const user = await User.findOne({ userId: message.author.id });

      if (!user) {
        return message.reply("❌ ليس لديك حساب بعد! استخدم أي أمر آخر أولاً.");
      }

      // إرسال مستوى المستخدم
      message.reply(`🏆 مستواك الحالي: **${user.level}**`);
    } catch (error) {
      console.error(error);
      message.reply("❌ حدث خطأ أثناء الحصول على المستوى.");
    }
  },
};
