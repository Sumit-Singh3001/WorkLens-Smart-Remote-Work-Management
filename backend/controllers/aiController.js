const Submission = require("../models/Submission");
const Task = require("../models/Task");

const verifySubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId).populate("task");

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    const task = await Task.findById(submission.task._id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Basic relevance check for the first version.
    // Later, this will be replaced with a real AI model.
    const taskWords = task.title
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 3);

    const fileName = submission.fileUrl.toLowerCase();

    const matchedWords = taskWords.filter((word) =>
      fileName.includes(word)
    );

    if (matchedWords.length > 0) {
      submission.aiStatus = "relevant";
      submission.aiFeedback =
        "The submitted file appears relevant to the assigned task.";
    } else {
      submission.aiStatus = "needs_review";
      submission.aiFeedback =
        "The submitted file could not be confidently matched with the task. Manager review is required.";
    }

    await submission.save();

    res.json({
      message: "AI verification completed",
      submission,
    });
  } catch (error) {
    res.status(500).json({
      message: "AI verification failed",
      error: error.message,
    });
  }
};

module.exports = {
  verifySubmission,
};