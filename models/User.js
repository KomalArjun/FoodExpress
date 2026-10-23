const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  mobile: { type: String, required: true, trim: true, match: /^[0-9+() -]{7,20}$/ },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false }
}, { timestamps: true });
userSchema.set("toJSON", { transform: (_doc, ret) => { delete ret.passwordHash; delete ret.__v; return ret; } });
module.exports = mongoose.model("User", userSchema);
