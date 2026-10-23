const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendWelcomeEmail } = require("../services/emailService");

function cleanUser(user) {
  return { id: user._id.toString(), name: user.name, mobile: user.mobile, email: user.email };
}

exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const mobile = String(req.body.mobile || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (name.length < 2 || name.length > 80) return res.status(400).json({ message: "Enter a name between 2 and 80 characters." });
    if (!/^[0-9+() -]{7,20}$/.test(mobile)) return res.status(400).json({ message: "Enter a valid mobile number." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: "Enter a valid email address." });
    if (password.length < 8 || password.length > 72) return res.status(400).json({ message: "Password must contain 8–72 characters." });
    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ message: "An account with this email already exists. Please log in." });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, mobile, email, passwordHash });
    // Fire the email after persistence. Provider outages do not fail registration.
    const emailResult = await sendWelcomeEmail(user);
    return res.status(201).json({
      message: emailResult.sent ? "Account created successfully. A welcome email has been sent." : "Account created successfully. Email delivery is not configured or is temporarily unavailable.",
      emailSent: emailResult.sent,
      user: cleanUser(user)
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists. Please log in." });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return res.status(400).json({ message: "Enter your email and password." });
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    req.session.userId = user._id.toString();
    req.session.save(err => {
      if (err) return next(err);
      res.json({ message: "Login successful.", user: cleanUser(user) });
    });
  } catch (error) { next(error); }
};

exports.logout = (req, res, next) => {
  if (!req.session) return res.json({ message: "Logged out." });
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie("connect.sid", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    res.json({ message: "Logged out successfully." });
  });
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ message: "Please log in." });
    res.json({ user: cleanUser(user) });
  } catch (error) { next(error); }
};
