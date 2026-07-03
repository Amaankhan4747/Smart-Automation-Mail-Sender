const EmailHistory = require("../models/EmailHistory");

// GET /history
exports.listHistory = async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };

  const history = await EmailHistory.find(filter)
    .populate("user", "name email")
    .sort({ sentAt: -1 })
    .limit(500);

  res.render("history", { title: "Email History", active: "history", history });
};
