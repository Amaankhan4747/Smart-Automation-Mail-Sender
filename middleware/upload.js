const multer = require("multer");

/**
 * Resumes are kept in memory only for the duration of the request, then
 * saved straight into MongoDB (Template.resumeData). This avoids relying
 * on the local filesystem entirely, so uploads work identically no matter
 * which machine, folder, or server instance is running the app.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for resumes."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
