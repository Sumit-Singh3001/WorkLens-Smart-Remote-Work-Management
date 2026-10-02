const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const { title, description, deadline, assignedTo, organization } = req.body;

    if (!title || !description || !deadline || !assignedTo || !organization) {
      return res.status(400).json({
        message: "All task fields are required",
      });
    }

    if (
      req.user.organization &&
      req.user.organization.toString() !== organization.toString()
    ) {
      return res.status(403).json({
        message: "Access denied for this organization",
      });
    }

    const task = await Task.create({
      title,
      description,
      deadline,
      assignedTo,
      organization,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Task creation failed",
      error: error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "employee") {
      query.assignedTo = req.user.id;
    }

    if (req.user.organization) {
      query.organization = req.user.organization;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role")
      .populate("organization", "name");

    res.json({
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get tasks",
      error: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "submitted",
      "under_review",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (
      req.user.organization &&
      task.organization.toString() !== req.user.organization.toString()
    ) {
      return res.status(403).json({
        message: "Access denied for this organization",
      });
    }

    task.status = status;
    await task.save();

    res.json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task status",
      error: error.message,
    });
  }
};

const getProgress = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "employee") {
      query.assignedTo = req.user.id;
    }

    if (req.user.organization) {
      query.organization = req.user.organization;
    }

    const total = await Task.countDocuments(query);
    const pending = await Task.countDocuments({ ...query, status: "pending" });
    const submitted = await Task.countDocuments({ ...query, status: "submitted" });
    const underReview = await Task.countDocuments({
      ...query,
      status: "under_review",
    });
    const approved = await Task.countDocuments({ ...query, status: "approved" });
    const rejected = await Task.countDocuments({ ...query, status: "rejected" });

    res.json({
      total,
      pending,
      submitted,
      underReview,
      approved,
      rejected,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get progress",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  getProgress,
};