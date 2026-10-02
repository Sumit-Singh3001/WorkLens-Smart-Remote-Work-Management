const Task = require("../models/Task");
const Submission = require("../models/Submission");

const getTimeline = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("organization", "name");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Always use the latest submission
    const submission = await Submission.findOne({
      task: taskId,
    }).sort({ createdAt: -1 });

    const finalStage =
      task.status === "rejected" ? "Rejected" : "Approved";

    const timeline = [
      {
        stage: "Assigned",
        completed: true,
        date: task.createdAt,
      },
      {
        stage: "Submitted",
        completed: !!submission,
        date: submission ? submission.createdAt : null,
      },
      {
        stage: "AI Checked",
        completed:
          !!submission && submission.aiStatus !== "pending",
        date:
          submission && submission.aiStatus !== "pending"
            ? submission.updatedAt
            : null,
      },
      {
        stage: "Manager Reviewed",
        completed:
          !!submission && submission.managerStatus !== "pending",
        date:
          submission && submission.managerStatus !== "pending"
            ? submission.updatedAt
            : null,
      },
      {
        stage: finalStage,
        completed:
          task.status === "approved" ||
          task.status === "rejected",
        date:
          task.status === "approved" ||
          task.status === "rejected"
            ? task.updatedAt
            : null,
      },
    ];

    res.json({
      task: {
        id: task._id,
        title: task.title,
        status: task.status,
      },
      timeline,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get timeline",
      error: error.message,
    });
  }
};

module.exports = {
  getTimeline,
};