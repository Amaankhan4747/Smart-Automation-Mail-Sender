const Template = require("../models/Template");

const isAdmin = (user) => user.role === "admin";

// GET /templates
exports.listTemplates = async (req, res) => {
  const filter = isAdmin(req.user) ? {} : { user: req.user._id };
  const templates = await Template.find(filter)
    .select("-resumeData") // don't pull large binary data into the list view
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.render("templates/list", { title: "Manage Templates", active: "templates", templates });
};

// GET /templates/new
exports.newTemplateForm = (req, res) => {
  if (req.user.role === "viewer") {
    req.flash("error", "Viewers cannot create templates.");
    return res.redirect("/templates");
  }
  res.render("templates/new", { title: "Add New Template", active: "templates" });
};

// POST /templates
exports.createTemplate = async (req, res) => {
  try {
    if (req.user.role === "viewer") {
      req.flash("error", "Viewers cannot create templates.");
      return res.redirect("/templates");
    }

    const { jobProfile, subject, content } = req.body;

    if (!jobProfile || !subject || !content) {
      req.flash("error", "Job Profile, Subject and Email Content are required.");
      return res.redirect("/templates/new");
    }

    if (!req.file) {
      req.flash("error", "Please upload a resume PDF for this job profile.");
      return res.redirect("/templates/new");
    }

    await Template.create({
      user: req.user._id,
      jobProfile: jobProfile.trim(),
      subject: subject.trim(),
      content,
      resumeData: req.file.buffer,
      resumeContentType: req.file.mimetype,
      resumeOriginalName: req.file.originalname,
    });

    req.flash("success", `Template "${jobProfile}" created successfully.`);
    res.redirect("/templates");
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      req.flash("error", "You already have a template with this Job Profile name.");
    } else {
      req.flash("error", "Something went wrong while creating the template.");
    }
    res.redirect("/templates/new");
  }
};

// GET /templates/:id/edit
exports.editTemplateForm = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).select("-resumeData");

    if (!template) {
      req.flash("error", "Template not found.");
      return res.redirect("/templates");
    }

    if (!isAdmin(req.user) && String(template.user) !== String(req.user._id)) {
      req.flash("error", "You can only edit your own templates.");
      return res.redirect("/templates");
    }

    res.render("templates/edit", { title: "Edit Template", active: "templates", template });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/templates");
  }
};

// PUT /templates/:id
exports.updateTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      req.flash("error", "Template not found.");
      return res.redirect("/templates");
    }

    if (!isAdmin(req.user) && String(template.user) !== String(req.user._id)) {
      req.flash("error", "You can only edit your own templates.");
      return res.redirect("/templates");
    }

    const { jobProfile, subject, content } = req.body;

    if (!jobProfile || !subject || !content) {
      req.flash("error", "Job Profile, Subject and Email Content are required.");
      return res.redirect(`/templates/${template._id}/edit`);
    }

    template.jobProfile = jobProfile.trim();
    template.subject = subject.trim();
    template.content = content;

    if (req.file) {
      // Simply overwrite the binary field in MongoDB — no disk file to clean up.
      template.resumeData = req.file.buffer;
      template.resumeContentType = req.file.mimetype;
      template.resumeOriginalName = req.file.originalname;
    }

    await template.save();

    req.flash("success", "Template updated successfully.");
    res.redirect("/templates");
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      req.flash("error", "Another template with this Job Profile name already exists.");
    } else {
      req.flash("error", "Something went wrong while updating the template.");
    }
    res.redirect("/templates");
  }
};

// DELETE /templates/:id
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).select("-resumeData");

    if (!template) {
      req.flash("error", "Template not found.");
      return res.redirect("/templates");
    }

    if (!isAdmin(req.user) && String(template.user) !== String(req.user._id)) {
      req.flash("error", "You can only delete your own templates.");
      return res.redirect("/templates");
    }

    await template.deleteOne();

    req.flash("success", `Template "${template.jobProfile}" deleted.`);
    res.redirect("/templates");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while deleting the template.");
    res.redirect("/templates");
  }
};

// GET /templates/:id/resume  (view / download the PDF straight from MongoDB)
exports.serveResume = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id).select(
      "user resumeData resumeContentType resumeOriginalName"
    );

    if (!template) {
      req.flash("error", "Resume not found.");
      return res.redirect("/templates");
    }

    if (!isAdmin(req.user) && String(template.user) !== String(req.user._id)) {
      req.flash("error", "You can only view your own resumes.");
      return res.redirect("/templates");
    }

    res.set({
      "Content-Type": template.resumeContentType || "application/pdf",
      "Content-Disposition": `inline; filename="${template.resumeOriginalName}"`,
    });
    res.send(template.resumeData);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while loading the resume.");
    res.redirect("/templates");
  }
};
