const Submission = require("../models/Submission");
const Task = require("../models/Task");

const createSubmission = async (req, res) => {
  try {
    const { task } = req.body;

    if (!task || !req.file) {
      return res.status(400).json({
        message: "Task and file are required",
      });
    }

    const existingTask = await Task.findById(task);

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Debug deadline
    console.log("CURRENT TIME:", new Date());
    console.log("TASK DEADLINE:", existingTask.deadline);

    // Check deadline
    if (new Date() > new Date(existingTask.deadline)) {
      return res.status(400).json({
        message: "Deadline passed. Submission not allowed.",
      });
    }

    if (
      req.user.role === "employee" &&
      existingTask.assignedTo.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "You can only submit work for your own tasks",
      });
    }

    if (
      req.user.organization &&
      existingTask.organization.toString() !==
        req.user.organization.toString()
    ) {
      return res.status(403).json({
        message: "Access denied for this organization",
      });
    }

    // Find the latest submission for this task by this employee
    const existingSubmission = await Submission.findOne({
      task,
      submittedBy: req.user.id,
    }).sort({ createdAt: -1 });

    // Resubmit after rejection or requested changes
    if (
      existingSubmission &&
      ["rejected", "changes_requested"].includes(
        existingSubmission.managerStatus
      )
    ) {
      existingSubmission.fileUrl = req.file.path;
      existingSubmission.aiStatus = "pending";
      existingSubmission.aiFeedback = "";
      existingSubmission.managerStatus = "pending";
      existingSubmission.managerFeedback = "";

      await existingSubmission.save();

      existingTask.status = "submitted";
      await existingTask.save();

      return res.status(200).json({
        message: "Work resubmitted successfully",
        submission: existingSubmission,
      });
    }

    // First submission
    if (!existingSubmission) {
      const submission = await Submission.create({
        task,
        submittedBy: req.user.id,
        fileUrl: req.file.path,
      });

      existingTask.status = "submitted";
      await existingTask.save();

      return res.status(201).json({
        message: "Submission created successfully",
        submission,
      });
    }

    return res.status(400).json({
      message:
        "This task already has a submission. Wait for manager review before submitting again.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Submission creation failed",
      error: error.message,
    });
  }
};

const getSubmissions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "employee") {
      query.submittedBy = req.user.id;
    }

    if (req.user.organization) {
      const organizationTasks = await Task.find({
        organization: req.user.organization,
      }).select("_id");

      const taskIds = organizationTasks.map((task) => task._id);

      query.task = { $in: taskIds };
    }

    const submissions = await Submission.find(query)
      .populate("task", "title description deadline status")
      .populate("submittedBy", "name email role")
      .sort({ createdAt: -1 });

    // Return only the latest submission for each task
    const latestSubmissions = [];

    for (const submission of submissions) {
      const alreadyExists = latestSubmissions.some(
        (item) =>
          item.task &&
          submission.task &&
          item.task._id.toString() === submission.task._id.toString()
      );

      if (!alreadyExists) {
        latestSubmissions.push(submission);
      }
    }

    res.json({
      submissions: latestSubmissions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get submissions",
      error: error.message,
    });
  }
};

module.exports = {
  createSubmission,
  getSubmissions,
};