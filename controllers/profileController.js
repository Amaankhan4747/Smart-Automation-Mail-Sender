const User = require("../models/User");

// GET /profile
exports.getProfile = (req, res) => {
  res.render("profile", { title: "Profile & Email Settings", active: "profile" });
};

// POST /profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, host, port, secure, authUser, authPass } = req.body;

    const user = await User.findById(req.user._id);
    user.name = name || user.name;

    user.smtp.host = host || "";
    user.smtp.port = port ? Number(port) : 587;
    user.smtp.secure = secure === "on" || secure === "true";
    user.smtp.authUser = authUser || "";

    // Only overwrite the stored password if the user typed a new one
    if (authPass && authPass.trim().length > 0) {
      user.smtp.authPass = authPass.trim();
    }

    await user.save();

    req.flash("success", "Profile & email settings updated.");
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while updating your profile.");
    res.redirect("/profile");
  }
};
