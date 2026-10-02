const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    aiStatus: {
      type: String,
      enum: ["pending", "relevant", "not_relevant", "needs_review"],
      default: "pending",
    },

    aiFeedback: {
      type: String,
      default: "",
    },

    managerStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "changes_requested"],
      default: "pending",
    },

    managerFeedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);