const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const smtpConfigSchema = new mongoose.Schema(
  {
    host: { type: String, trim: true, default: "" },
    port: { type: Number, default: 587 },
    secure: { type: Boolean, default: false },
    authUser: { type: String, trim: true, default: "" }, // the sending email address
    authPass: { type: String, default: "" }, // app password / SMTP password
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "viewer"],
      default: "user",
    },
    smtp: { type: smtpConfigSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.hasSmtpConfigured = function () {
  return Boolean(this.smtp && this.smtp.authUser && this.smtp.authPass && this.smtp.host);
};

module.exports = mongoose.model("User", userSchema);
