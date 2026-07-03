const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const { isAuthenticated } = require("../middleware/auth");

router.get("/", isAuthenticated, homeController.getHome);
router.get("/api/templates/:id", isAuthenticated, homeController.getTemplateJson);
router.post("/send-email", isAuthenticated, homeController.sendEmail);

module.exports = router;
