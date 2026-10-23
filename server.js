require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const rateLimit = require("express-rate-limit");
const pageRoutes = require("./routes/pageRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  console.error("SESSION_SECRET is missing. Copy .env.example to .env and configure it.");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing. Configure it in your .env file.");
  process.exit(1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", 1);

const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: "sessions" }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Number(process.env.SESSION_MAX_AGE_DAYS || 7) * 24 * 60 * 60 * 1000
  }
};
app.use(session(sessionOptions));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." } });
app.use("/api/auth", authLimiter);

app.use("/", pageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ message: "API endpoint not found." });
  res.status(404).send("Page not found.");
});
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({ message: status === 500 ? "Something went wrong. Please try again." : err.message });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`FoodExpress running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
