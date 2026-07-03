const User = require("../models/User");

exports.getRegister = (req, res) => {
  res.render("register", { title: "Create Account" });
};

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      req.flash("error", "All fields are required.");
      return res.redirect("/register");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters long.");
      return res.redirect("/register");
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      req.flash("error", "An account with this email already exists.");
      return res.redirect("/register");
    }

    // First-ever registered user automatically becomes admin so the app is usable out of the box.
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const user = await User.create({ name, email, password, role });

    req.session.userId = user._id;
    req.flash("success", `Welcome, ${user.name}! Your account has been created.`);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while creating your account.");
    res.redirect("/register");
  }
};

exports.getLogin = (req, res) => {
  res.render("login", { title: "Log In" });
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password are required.");
      return res.redirect("/login");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.comparePassword(password))) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    if (!user.isActive) {
      req.flash("error", "Your account has been deactivated. Contact an administrator.");
      return res.redirect("/login");
    }

    req.session.userId = user._id;
    req.flash("success", `Welcome back, ${user.name}!`);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while logging in.");
    res.redirect("/login");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
