const express = require("express");

const { reviewSubmission } = require("../controllers/reviewController");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.patch(
  "/:submissionId",
  protect,
  allowRoles("admin", "manager"),
  reviewSubmission
);

module.exports = router;