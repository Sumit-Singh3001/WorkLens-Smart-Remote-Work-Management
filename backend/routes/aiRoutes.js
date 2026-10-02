const express = require("express");

const { verifySubmission } = require("../controllers/aiController");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/verify/:submissionId",
  protect,
  allowRoles("admin", "manager"),
  verifySubmission
);

module.exports = router;