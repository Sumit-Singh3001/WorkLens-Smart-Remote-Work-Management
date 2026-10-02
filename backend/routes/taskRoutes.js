const express = require("express");

const {
  createTask,
  getTasks,
  updateTaskStatus,
  getProgress,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("admin", "manager"),
  createTask
);

router.get("/progress", protect, getProgress);

router.get("/", protect, getTasks);

router.patch(
  "/:id/status",
  protect,
  allowRoles("admin", "manager"),
  updateTaskStatus
);

module.exports = router;