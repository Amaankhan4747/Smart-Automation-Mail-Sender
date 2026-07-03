const User = require("../models/User");

/**
 * Ensures a session exists and attaches the fresh user document to req.user.
 * Redirects to /login when there's no valid session.
 */
exports.isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      req.flash("error", "Please log in to continue.");
      return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId);

    if (!user || !user.isActive) {
      req.session.destroy(() => {});
      req.flash("error", "Your session has expired. Please log in again.");
      return res.redirect("/login");
    }

    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Redirects already-authenticated users away from login/register pages.
 */
exports.isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }
  next();
};

/**
 * Role-gate. Usage: hasRole("admin") or hasRole("admin", "user")
 */
exports.hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      req.flash("error", "You do not have permission to perform this action.");
      return res.redirect("/");
    }
    next();
  };
};
