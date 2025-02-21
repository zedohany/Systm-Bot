const User = require("../models/User");

const adminIds = ["806533369709330502", "1333859450502512651"]; // ضع هنا معرفات الإدمنز

module.exports = {
  name: "admindeduct",
  description: "سحب الأموال من حساب المستخدمين من قبل الإدمنز",
  async execute(message, args) {
    if (!adminIds.includes(message.author.id)) {
      return message.reply("❌ ليس لديك صلاحية لاستخدام هذا الأمر!");
    }

    const targetId = args[0]?.replace(/<@!?(\d+)>/, "$1"); // استخراج ID من المنشن إن وجد
    const amount = parseInt(args[1]);

    if (!targetId || isNaN(amount) || amount <= 0) {
      return message.reply(
        "❌ الاستخدام الصحيح: `!admindeduct @المستخدم المبلغ` أو `!admindeduct ID المبلغ`",
      );
    }

    try {
      let user = await User.findOne({ userId: targetId });

      if (!user) {
        return message.reply("❌ المستخدم غير موجود في قاعدة البيانات!");
      }

      if (user.balance < amount) {
        return message.reply("❌ المستخدم لا يملك هذا المبلغ الكافي للسحب!");
      }

      user.balance -= amount;
      await user.save();
      message.reply(`✅ تم خصم **${amount}** عملة من <@${targetId}> بنجاح 💰`);

      const targetUser = await message.client.users.fetch(targetId);
      if (targetUser) {
        targetUser.send(
          `❌ تم خصم **${amount}** عملة من حسابك بواسطة أحد المسؤولين.`,
        );
      }
    } catch (error) {
      console.error("حدث خطأ أثناء تنفيذ الأمر", error);
      message.reply("❌ حدث خطأ ما أثناء تنفيذ العملية. حاول مرة أخرى لاحقًا.");
    }
  },
};
