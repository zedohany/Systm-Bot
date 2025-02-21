const { SlashCommandBuilder } = require("discord.js");
const User = require("../models/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ranking")
    .setDescription("Show users ranking by balance 🏆"),

  name: "ranking",
  description: "Show users ranking by balance 🏆",

  async execute(interactionOrMessage, args = []) {
    try {
      // تحديد ما إذا كان الطلب من سلاش كوماند أو رسالة نصية
      const isSlash = !!interactionOrMessage.isChatInputCommand;
      const sendReply = async (content) => {
        if (isSlash) {
          await interactionOrMessage.reply({ content, ephemeral: false });
        } else {
          await interactionOrMessage.reply(content);
        }
      };

      // جلب أعلى 10 مستخدمين حسب الرصيد
      const users = await User.find().sort({ balance: -1 }).limit(10);

      if (!users.length) {
        return sendReply("❌ لا يوجد مستخدمين لعرض ترتيبهم.");
      }

      // إنشاء قائمة الترتيب
      let rankingList = users
        .map(
          (user, index) =>
            `${index + 1}. **${user.username}** - ${user.balance} 💰`,
        )
        .join("\n");

      sendReply(`🏆 **ترتيب المستخدمين حسب الرصيد:**\n${rankingList}`);
    } catch (error) {
      console.error(error);
      interactionOrMessage.reply("❌ حدث خطأ أثناء الحصول على المصنفين.");
    }
  },
};
