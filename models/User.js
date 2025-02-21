const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // معرف المستخدم
  username: { type: String, required: true }, // اسم المستخدم
  balance: { type: Number, default: 0 }, // الرصيد الافتراضي
  lastDaily: { type: Date, default: null }, // تاريخ آخر مرة تم فيها استلام الأموال اليومية
});

const User = mongoose.model("User", userSchema);

module.exports = User;
