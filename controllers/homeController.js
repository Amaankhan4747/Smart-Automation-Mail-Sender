const Template = require("../models/Template");
const EmailHistory = require("../models/EmailHistory");
const { sendResumeEmail } = require("../utils/mailer");

// GET /
exports.getHome = async (req, res) => {
  const templates = await Template.find({ user: req.user._id })
    .select("-resumeData")
    .sort({ jobProfile: 1 });

  res.render("home", {
    title: "Home",
    active: "home",
    templates,
    smtpConfigured: req.user.hasSmtpConfigured(),
  });
};

// GET /api/templates/:id  (AJAX - auto-fill subject/content/resume)
exports.getTemplateJson = async (req, res) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, user: req.user._id }).select(
      "-resumeData"
    );
    if (!template) {
      return res.status(404).json({ error: "Template not found." });
    }
    res.json({
      id: template._id,
      jobProfile: template.jobProfile,
      subject: template.subject,
      content: template.content,
      resumeOriginalName: template.resumeOriginalName,
      resumeUrl: `/templates/${template._id}/resume`,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

// POST /send-email
exports.sendEmail = async (req, res) => {
  const { templateId, toEmail } = req.body;

  let template = null;

  try {
    if (!templateId || !toEmail) {
      req.flash("error", "Please select a Job Profile and enter a recipient email.");
      return res.redirect("/");
    }

    // Includes resumeData here — the PDF bytes come straight from MongoDB,
    // so sending works no matter which machine/folder the server is running from.
    template = await Template.findOne({ _id: templateId, user: req.user._id });

    if (!template) {
      req.flash("error", "Selected template could not be found.");
      return res.redirect("/");
    }

    if (!req.user.hasSmtpConfigured()) {
      req.flash("error", "Please configure your sending email in Profile -> Email Settings first.");
      return res.redirect("/profile");
    }

    await sendResumeEmail({
      user: req.user,
      toEmail,
      subject: template.subject,
      content: template.content,
      resumeBuffer: template.resumeData,
      resumeOriginalName: template.resumeOriginalName,
    });

    await EmailHistory.create({
      user: req.user._id,
      template: template._id,
      jobProfile: template.jobProfile,
      fromEmail: req.user.smtp.authUser,
      toEmail,
      subject: template.subject,
      status: "Sent",
    });

    req.flash("success", `Email sent to ${toEmail} for "${template.jobProfile}".`);
    res.redirect("/");
  } catch (err) {
    console.error(err);

    await EmailHistory.create({
      user: req.user._id,
      template: template ? template._id : undefined,
      jobProfile: template ? template.jobProfile : "Unknown",
      fromEmail: req.user.smtp ? req.user.smtp.authUser : "",
      toEmail: toEmail || "",
      subject: template ? template.subject : "",
      status: "Failed",
      errorMessage: err.message,
    });

    req.flash("error", `Failed to send email: ${err.message}`);
    res.redirect("/");
  }
};
