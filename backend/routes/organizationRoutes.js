const express = require("express");
const { createOrganization } = require("../controllers/organizationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrganization);

module.exports = router;