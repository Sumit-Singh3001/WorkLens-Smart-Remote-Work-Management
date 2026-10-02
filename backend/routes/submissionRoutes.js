const express = require("express");

const {
  createSubmission,
  getSubmissions,
} = require("../controllers/submissionController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("file"),
  createSubmission
);

router.get("/", protect, getSubmissions);

module.exports = router;