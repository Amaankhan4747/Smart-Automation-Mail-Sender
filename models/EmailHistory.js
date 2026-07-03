const mongoose = require("mongoose");

const emailHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
    jobProfile: { type: String, required: true },
    fromEmail: { type: String, required: true },
    toEmail: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ["Sent", "Failed"], required: true },
    errorMessage: { type: String, default: "" },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailHistory", emailHistorySchema);
