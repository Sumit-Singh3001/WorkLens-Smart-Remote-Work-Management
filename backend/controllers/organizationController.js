const Organization = require("../models/Organization");
const User = require("../models/User");

const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Organization name is required",
      });
    }

    const organization = await Organization.create({
      name,
      createdBy: req.user.id,
    });

    await User.findByIdAndUpdate(req.user.id, {
      organization: organization._id,
    });

    res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    res.status(500).json({
      message: "Organization creation failed",
      error: error.message,
    });
  }
};

module.exports = {
  createOrganization,
};