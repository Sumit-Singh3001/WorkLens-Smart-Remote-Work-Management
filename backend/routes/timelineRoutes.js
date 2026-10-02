const express = require("express");

const { getTimeline } = require("../controllers/timelineController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:taskId", protect, getTimeline);

module.exports = router;