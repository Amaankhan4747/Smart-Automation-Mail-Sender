const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobProfile: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    resumeData: { type: Buffer, required: true }, // the PDF bytes, stored directly in MongoDB
    resumeContentType: { type: String, default: "application/pdf" },
    resumeOriginalName: { type: String, required: true }, // original upload name shown to user
  },
  { timestamps: true }
);

// A given user shouldn't have two templates with the exact same job profile name
templateSchema.index({ user: 1, jobProfile: 1 }, { unique: true });

module.exports = mongoose.model("Template", templateSchema);
