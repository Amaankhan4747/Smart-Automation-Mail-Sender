const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAuthenticated, hasRole } = require("../middleware/auth");

router.use(isAuthenticated, hasRole("admin"));

router.get("/users", adminController.listUsers);
router.post("/users/:id/role", adminController.updateUserRole);
router.post("/users/:id/toggle-active", adminController.toggleUserActive);

module.exports = router;
