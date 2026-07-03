require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const templateRoutes = require("./routes/templateRoutes");
const historyRoutes = require("./routes/historyRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ---------- Database ----------
connectDB();

// ---------- View engine ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- Core middleware ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------- Sessions (persisted in MongoDB, same dynamic URI) ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "smart_resume_mail_sender_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
    },
  })
);

// ---------- Flash messages ----------
app.use(flash());
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = null; // overwritten by isAuthenticated once a session exists
  next();
});

// ---------- Routes ----------
app.use("/", authRoutes);
app.use("/", homeRoutes);
app.use("/templates", templateRoutes);
app.use("/history", historyRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes("Only PDF files")) {
    req.flash("error", err.message);
    return res.redirect("back");
  }
  res.status(500).render("500", { title: "Server Error", error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Smart Resume Mail Sender running on http://localhost:${PORT}`);
});

// Keep the process alive on unexpected async errors (e.g. a transient DB
// hiccup) instead of crashing the whole server.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
