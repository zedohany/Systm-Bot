const User = require("../models/User");

const adminIds = ["806533369709330502", "1333859450502512651"]; // ضع هنا معرفات الإدمنز

module.exports = {
  name: "adminpay",
  description: "تحويل الأموال من قبل المشرفين إلى المستخدمين",
  async execute(message, args) {
    if (!adminIds.includes(message.author.id)) {
      return message.reply("❌ ليس لديك صلاحية لاستخدام هذا الأمر!");
    }

    const targetId = args[0]?.replace(/<@!?(\d+)>/, "$1"); // استخراج ID من المنشن إن وجد
    const amount = parseInt(args[1]);

    if (!targetId || isNaN(amount) || amount <= 0) {
      return message.reply(
        "❌ الاستخدام الصحيح: `!adminpay @المستخدم المبلغ` أو `!adminpay ID المبلغ`",
      );
    }

    try {
      let receiver = await User.findOne({ userId: targetId });

      if (!receiver) {
        receiver = new User({
          userId: targetId,
          username: `مستخدم#${targetId}`,
          balance: amount,
        });
      } else {
        receiver.balance += amount;
      }

      await receiver.save();
      message.reply(
        `✅ تم تحويل **${amount}** عملة إلى <@${targetId}> بنجاح 💰`,
      );

      const user = await message.client.users.fetch(targetId);
      if (user) {
        user.send(`💰 لقد استلمت **${amount}** عملة من أحد المسؤولين!`);
      }
    } catch (error) {
      console.error("حدث خطأ أثناء تنفيذ الأمر", error);
      message.reply("❌ حدث خطأ ما أثناء تنفيذ العملية. حاول مرة أخرى لاحقًا.");
    }
  },
};
