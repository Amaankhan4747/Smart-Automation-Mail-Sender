const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const { isAuthenticated } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", isAuthenticated, templateController.listTemplates);
router.get("/new", isAuthenticated, templateController.newTemplateForm);
router.post("/", isAuthenticated, upload.single("resume"), templateController.createTemplate);

router.get("/:id/edit", isAuthenticated, templateController.editTemplateForm);
router.get("/:id/resume", isAuthenticated, templateController.serveResume);
router.put("/:id", isAuthenticated, upload.single("resume"), templateController.updateTemplate);
router.delete("/:id", isAuthenticated, templateController.deleteTemplate);

module.exports = router;
