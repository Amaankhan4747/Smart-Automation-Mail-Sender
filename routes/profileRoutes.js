const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { isAuthenticated } = require("../middleware/auth");

router.get("/", isAuthenticated, profileController.getProfile);
router.post("/", isAuthenticated, profileController.updateProfile);

module.exports = router;
