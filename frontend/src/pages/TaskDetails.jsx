import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "../api";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTaskDetails = async () => {
      try {
        const taskResponse = await fetch(
          `${API_URL}/api/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const taskData = await taskResponse.json();

        if (!taskResponse.ok) {
          setMessage(taskData.message || "Failed to load task");
          return;
        }

        const selectedTask = taskData.tasks.find(
          (item) => item._id === id
        );

        if (!selectedTask) {
          setMessage("Task not found");
          return;
        }

        setTask(selectedTask);

        const submissionResponse = await fetch(
          `${API_URL}/api/submissions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const submissionData = await submissionResponse.json();

        if (submissionResponse.ok) {
          const selectedSubmission =
            submissionData.submissions.find(
              (item) => item.task?._id === id
            );

          setSubmission(selectedSubmission || null);
        }

        const timelineResponse = await fetch(
          `${API_URL}/api/timeline/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const timelineData = await timelineResponse.json();

        if (timelineResponse.ok) {
          setTimeline(timelineData.timeline || []);
        }
      } catch {
        setMessage("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-400">Loading task...</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="rounded-lg bg-red-950 px-4 py-3 text-red-300">
          {message}
        </p>

        <button
          onClick={() => navigate("/tasks")}
          className="mt-5 rounded-lg bg-white px-5 py-2 font-semibold text-slate-950"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">WorkLens</h1>

          <button
            onClick={() => navigate("/tasks")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Back to Tasks
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <p className="text-sm text-slate-400">
                Assigned Task
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {task.title}
              </h2>
            </div>

            <span className="h-fit rounded-full bg-slate-800 px-4 py-2 text-sm capitalize text-slate-300">
              {task.status.replace("_", " ")}
            </span>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold">
              Task Description
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              {task.description}
            </p>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6">
            <p className="text-sm text-slate-400">
              Deadline
            </p>

            <p className="mt-1 font-medium">
              {new Date(task.deadline).toLocaleString()}
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-6">
            <h3 className="text-xl font-semibold">
              Work Evidence Timeline
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Track the task from assignment to final decision.
            </p>

            <div className="mt-6 space-y-5">
              {timeline.map((item, index) => (
                <div
                  key={item.stage}
                  className="flex items-start gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        item.completed
                          ? "bg-green-700 text-white"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {item.completed ? "✓" : "•"}
                    </div>

                    {index < timeline.length - 1 && (
                      <div className="mt-1 h-8 w-px bg-slate-700" />
                    )}
                  </div>

                  <div>
                    <p
                      className={`font-medium ${
                        item.completed
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {item.stage}
                    </p>

                    {item.date && (
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {submission &&
            submission.managerStatus !== "pending" && (
              <div className="mt-8 rounded-xl border border-slate-700 bg-slate-950 p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">
                    Manager Review
                  </h3>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm capitalize">
                    {submission.managerStatus.replace(
                      "_",
                      " "
                    )}
                  </span>
                </div>

                {submission.managerFeedback && (
                  <div className="mt-5">
                    <p className="text-sm font-medium">
                      Manager Feedback
                    </p>

                    <p className="mt-2 rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-400">
                      {submission.managerFeedback}
                    </p>
                  </div>
                )}
              </div>
            )}

          <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-6">
            <h3 className="text-lg font-semibold">
              Submit Your Work
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Upload your completed deliverable for AI
              verification and manager review.
            </p>

            <button
              onClick={() =>
                navigate(`/tasks/${task._id}/submit`)
              }
              className="mt-5 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
            >
              Submit Work
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TaskDetails;