/**
 * Optional helper: creates (or promotes) an admin account using the
 * ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD values from .env
 *
 * Usage:  npm run seed:admin
 *
 * Note: the very first user to register through the app is
 * automatically made an admin, so this script is only needed if you
 * want to seed an admin account without using the sign-up form.
 */
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

(async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME || "Super Admin";
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";

  let user = await User.findOne({ email });

  if (user) {
    user.role = "admin";
    user.isActive = true;
    await user.save();
    console.log(`Existing user promoted to admin: ${email}`);
  } else {
    user = await User.create({ name, email, password, role: "admin" });
    console.log(`Admin account created: ${email} / ${password}`);
  }

  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
