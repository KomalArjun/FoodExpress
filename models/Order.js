const mongoose = require("mongoose");
const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 50 }
}, { _id: false });
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  customerName: { type: String, required: true, trim: true, maxlength: 80 },
  mobile: { type: String, required: true, trim: true, maxlength: 20 },
  address: { type: String, required: true, trim: true, maxlength: 500 },
  items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ["Google Pay", "PhonePe", "UPI", "Cash On Delivery"], required: true },
  paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  status: { type: String, enum: ["Placed", "Preparing", "Out for delivery", "Delivered", "Cancelled"], default: "Placed" }
}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);
