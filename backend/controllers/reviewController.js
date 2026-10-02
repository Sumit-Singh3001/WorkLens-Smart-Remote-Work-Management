const Submission = require("../models/Submission");
const Task = require("../models/Task");

const reviewSubmission = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const { submissionId } = req.params;

    const allowedStatuses = [
      "approved",
      "rejected",
      "changes_requested",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid review status",
      });
    }

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    submission.managerStatus = status;
    submission.managerFeedback = feedback || "";

    await submission.save();

    const taskStatus =
      status === "approved"
        ? "approved"
        : status === "rejected"
        ? "rejected"
        : "under_review";

    await Task.findByIdAndUpdate(submission.task, {
      status: taskStatus,
    });

    res.json({
      message: "Submission reviewed successfully",
      submission,
    });
  } catch (error) {
    res.status(500).json({
      message: "Review failed",
      error: error.message,
    });
  }
};

module.exports = {
  reviewSubmission,
};