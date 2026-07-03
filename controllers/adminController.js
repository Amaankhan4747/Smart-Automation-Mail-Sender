const User = require("../models/User");
const Template = require("../models/Template");
const EmailHistory = require("../models/EmailHistory");

// GET /admin/users
exports.listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const templateCounts = await Template.aggregate([{ $group: { _id: "$user", count: { $sum: 1 } } }]);
  const emailCounts = await EmailHistory.aggregate([{ $group: { _id: "$user", count: { $sum: 1 } } }]);

  const templateCountMap = Object.fromEntries(templateCounts.map((t) => [String(t._id), t.count]));
  const emailCountMap = Object.fromEntries(emailCounts.map((e) => [String(e._id), e.count]));

  res.render("admin/users", {
    title: "All Users",
    active: "admin",
    users,
    templateCountMap,
    emailCountMap,
  });
};

// POST /admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "user", "viewer"].includes(role)) {
      req.flash("error", "Invalid role.");
      return res.redirect("/admin/users");
    }

    if (String(req.params.id) === String(req.user._id)) {
      req.flash("error", "You cannot change your own role.");
      return res.redirect("/admin/users");
    }

    await User.findByIdAndUpdate(req.params.id, { role });
    req.flash("success", "User role updated.");
    res.redirect("/admin/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/users");
  }
};

// POST /admin/users/:id/toggle-active
exports.toggleUserActive = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      req.flash("error", "You cannot deactivate your own account.");
      return res.redirect("/admin/users");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/admin/users");
    }

    user.isActive = !user.isActive;
    await user.save();

    req.flash("success", `${user.name} has been ${user.isActive ? "activated" : "deactivated"}.`);
    res.redirect("/admin/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/users");
  }
};
