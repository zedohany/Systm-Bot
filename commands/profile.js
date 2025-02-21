const { AttachmentBuilder, SlashCommandBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const User = require("../models/User");

module.exports = {
  name: "profile", // للأوامر العادية (Prefix)
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("عرض ملف المستخدم الشخصي")
    .addUserOption(option =>
      option.setName("المستخدم")
        .setDescription("المستخدم الذي تريد رؤية ملفه الشخصي")
        .setRequired(false)
    ),

  async execute(interactionOrMessage, args) {
    try {
      let targetUser;
      let authorUsername;

      if (interactionOrMessage.user) {
        // أمر سلاش
        targetUser = interactionOrMessage.options.getUser("المستخدم") || interactionOrMessage.user;
        authorUsername = interactionOrMessage.user.username;
      } else {
        // أمر بريفكس
        targetUser = args[0] 
          ? await interactionOrMessage.client.users.fetch(args[0].replace(/<@!?(\d+)>/, "$1")).catch(() => null)
          : interactionOrMessage.author;

        if (!targetUser) {
          return interactionOrMessage.reply("❌ المستخدم غير موجود أو ID غير صالح.");
        }

        authorUsername = interactionOrMessage.author.username;
      }

      // البحث عن بيانات المستخدم في قاعدة البيانات
      let user = await User.findOne({ userId: targetUser.id });

      if (!user) {
        return interactionOrMessage.reply("❌ لم يتم العثور على بيانات المستخدم!");
      }

      // ترتيب المستخدم حسب الرصيد
      const users = await User.find().sort({ balance: -1 });
      const rank = users.findIndex((u) => u.userId === targetUser.id) + 1;

      // تحويل الأرقام الكبيرة إلى صيغة مختصرة
      const formatNumber = (num) => {
        if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
        if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
        return num.toString();
      };

      const formattedBalance = formatNumber(user.balance);
      const formattedRank = formatNumber(rank);

      // إنشاء لوحة الرسم
      const canvas = createCanvas(400, 400);
      const ctx = canvas.getContext("2d");

      // تحميل الخلفية
      const background = await loadImage("https://plus.unsplash.com/premium_photo-1663954863005-be2c2a35f32e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // تحميل الصورة الشخصية
      const avatar = await loadImage(targetUser.displayAvatarURL({ extension: "png", size: 128 }));

      ctx.save();
      ctx.beginPath();
      ctx.arc(200, 100, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 150, 50, 100, 100);
      ctx.restore();

      // إضافة النصوص
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(targetUser.username, 200, 180);

      ctx.font = "20px sans-serif";
      ctx.fillText(`Balance: ${formattedBalance}£`, 200, 220);
      ctx.fillText(`Rank: ${formattedRank}`, 200, 260);

      // تصدير الصورة
      const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
        name: "profile.png",
      });

      await interactionOrMessage.reply({ files: [attachment] });

    } catch (error) {
      console.error("❌ حدث خطأ أثناء تنفيذ الأمر:", error);
      interactionOrMessage.reply("❌ حدث خطأ أثناء عرض ملف المستخدم الشخصي.");
    }
  },
};