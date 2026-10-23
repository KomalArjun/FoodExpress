const Order = require("../models/Order");
const User = require("../models/User");

// Prices are checked against the server's menu catalogue to prevent client-side price tampering.
const MENU = {
  "Margherita Pizza": 299, "Farmhouse Pizza": 299, "Cheese Pizza": 279, "Paneer Pizza": 329,
  "Veggie Pizza": 289, "Corn Pizza": 269, "Cheese Burger": 179, "Paneer Burger": 189,
  "Double Cheese Burger": 229, "Crispy Veg Burger": 159, "Mexican Burger": 199, "Veg Burger": 149,
  "White Sauce Pasta": 199, "French Fries": 129, "Dossa": 149, "Paneer": 249, "Noddles": 179,
  "Paneer Chilli": 229, "Chicken Biryani": 249, "Chicken Lollipop": 279, "Chicken 65": 269,
  "Chicken Tikka": 299, "Chicken Fried Rice": 229, "Chicken Burger": 199, "Chicken Pizza": 349,
  "Chicken Tandoori": 399, "Chicken Wings": 279, "Chicken Shawarma": 299, "Chicken Kebab": 299,
  "Butter Chicken": 329, "Coke": 49, "Sprite": 49, "pepsi": 49, "Fanta": 49,
  "Chocolate Coffee": 89, "Cappuccino Coffee": 199, "Cold Coffee": 99, "Espresso": 109,
  "Donut": 119, "Pastry": 99, "Chocolate Cake": 299, "Vanilla Cake": 249,
  "Strawberry Cake": 299, "Black Forest Cake": 349, "Chocolate Pastry": 99,
  "Red Velvet Pastry": 129, "Pineapple Pastry": 109, "Cup Cake": 119
};

exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, mobile, address, items, paymentMethod } = req.body;
    if (!String(customerName || "").trim() || String(customerName).trim().length > 80) return res.status(400).json({ message: "Enter your name." });
    if (!/^[0-9+() -]{7,20}$/.test(String(mobile || "").trim())) return res.status(400).json({ message: "Enter a valid mobile number." });
    if (String(address || "").trim().length < 8 || String(address).trim().length > 500) return res.status(400).json({ message: "Enter a complete delivery address." });
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) return res.status(400).json({ message: "Your cart is empty or contains too many items." });
    const allowedPayments = ["Google Pay", "PhonePe", "UPI", "Cash On Delivery"];
    if (!allowedPayments.includes(paymentMethod)) return res.status(400).json({ message: "Choose a payment method." });

    const normalized = [];
    for (const item of items) {
      const name = String(item.name || "");
      const quantity = Number(item.quantity);
      if (!(name in MENU) || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        return res.status(400).json({ message: "One or more cart items are invalid. Refresh the page and try again." });
      }
      normalized.push({ name, price: MENU[name], quantity });
    }
    const total = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ message: "Please log in again." });
    const order = await Order.create({
      user: user._id,
      customerName: String(customerName).trim(),
      mobile: String(mobile).trim(),
      address: String(address).trim(),
      items: normalized,
      total,
      paymentMethod,
      // No payment gateway is integrated in this project; never mark an online payment as paid.
      paymentStatus: "Pending",
      status: "Placed"
    });
    res.status(201).json({ message: "Your order has been placed and saved.", order: {
      id: order._id.toString(), customerName: order.customerName, mobile: order.mobile,
      address: order.address, items: order.items, total: order.total,
      paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus,
      status: order.status, createdAt: order.createdAt
    }});
  } catch (error) { next(error); }
};

exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ orders: orders.map(order => ({ id: order._id.toString(), items: order.items, total: order.total,
      paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, status: order.status, createdAt: order.createdAt })) });
  } catch (error) { next(error); }
};
