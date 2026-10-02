import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ManagerDashboard() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [feedback, setFeedback] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});
  const [reviewing, setReviewing] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (user?.role !== "manager" && user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const [submissionResponse, employeeResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/submissions", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch("http://localhost:5000/api/auth/users", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const submissionData = await submissionResponse.json();
        const employeeData = await employeeResponse.json();

        if (!submissionResponse.ok) {
          setMessage(
            submissionData.message || "Failed to load submissions"
          );
          return;
        }

        if (!employeeResponse.ok) {
          setMessage(
            employeeData.message || "Failed to load employees"
          );
          return;
        }

        setSubmissions(submissionData.submissions);

        const employeeList = employeeData.users.filter(
          (item) => item.role === "employee"
        );

        setEmployees(employeeList);
      } catch {
        setMessage("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token, user?.role]);

  const createTask = async (e) => {
    e.preventDefault();

    if (!title || !description || !assignedTo || !deadline) {
      setMessage("Please fill all task details.");
      return;
    }

    try {
      setCreatingTask(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            assignedTo,
            deadline,
            organization: user.organization,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create task");
        setCreatingTask(false);
        return;
      }

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDeadline("");

      setMessage("Task created and assigned successfully.");
      setCreatingTask(false);
    } catch {
      setMessage("Unable to connect to the server");
      setCreatingTask(false);
    }
  };

  const verifySubmission = async (submissionId) => {
    try {
      setMessage("AI verification in progress...");

      const response = await fetch(
        `http://localhost:5000/api/ai/verify/${submissionId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "AI verification failed");
        return;
      }

      setSubmissions((currentSubmissions) =>
        currentSubmissions.map((submission) =>
          submission._id === submissionId
            ? data.submission
            : submission
        )
      );

      setMessage("AI verification completed.");
    } catch {
      setMessage("Unable to connect to the server");
    }
  };

  const handleReview = async (submissionId) => {
    const status = selectedStatus[submissionId];

    if (!status) {
      setMessage(
        "Please select Approve, Reject, or Request Changes first."
      );
      return;
    }

    try {
      setReviewing(submissionId);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/reviews/${submissionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            feedback: feedback[submissionId] || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Review failed");
        setReviewing("");
        return;
      }

      setSubmissions((currentSubmissions) =>
        currentSubmissions.map((submission) =>
          submission._id === submissionId
            ? {
                ...submission,
                ...data.submission,
              }
            : submission
        )
      );

      setMessage("Manager review submitted successfully.");

      setSelectedStatus((current) => ({
        ...current,
        [submissionId]: "",
      }));

      setReviewing("");
    } catch {
      setMessage("Unable to connect to the server");
      setReviewing("");
    }
  };

  const startLiveReview = (submission) => {
    const taskId = submission.task?._id || submission.task;
    const roomName = `WorkLens-${taskId}`;

    const jitsiUrl = `https://meet.jit.si/${roomName}`;

    window.open(
      jitsiUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getFileUrl = (fileUrl) => {
    return `http://localhost:5000/${fileUrl.replaceAll("\\", "/")}`;
  };

  const getButtonClass = (submissionId, status) => {
    const selected = selectedStatus[submissionId] === status;

    if (status === "approved") {
      return selected
        ? "rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white ring-2 ring-green-300"
        : "rounded-lg border border-green-700 bg-green-950 px-5 py-2.5 text-sm font-semibold text-green-300 hover:bg-green-900";
    }

    if (status === "rejected") {
      return selected
        ? "rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white ring-2 ring-red-300"
        : "rounded-lg border border-red-700 bg-red-950 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-900";
    }

    return selected
      ? "rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white ring-2 ring-blue-300"
      : "rounded-lg border border-blue-700 bg-blue-950 px-5 py-2.5 text-sm font-semibold text-blue-300 hover:bg-blue-900";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">WorkLens</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Employee View
            </button>

            <span className="text-sm text-slate-400">
              Manager
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-3xl font-bold">
          Manager Dashboard
        </h2>

        <p className="mt-2 text-slate-400">
          Assign tasks, verify submissions, and review employee work.
        </p>

        {message && (
          <p className="mt-6 rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300">
            {message}
          </p>
        )}

        <section className="mt-8">
          <div className="mb-5">
            <h3 className="text-2xl font-bold">
              Create & Assign Task
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Assign a new task with a deadline to an employee.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <form
              onSubmit={createTask}
              className="grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Task Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Assign To
                </label>

                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-white"
                >
                  <option value="">
                    Select Employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.name} - {employee.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe the task and expected deliverable"
                  rows="4"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Deadline
                </label>

                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="w-full rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingTask
                    ? "Creating Task..."
                    : "Create & Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <h3 className="text-2xl font-bold">
              Employee Submissions
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Review and verify work submitted by employees.
            </p>
          </div>

          {loading && (
            <p className="text-slate-400">
              Loading submissions...
            </p>
          )}

          {!loading && submissions.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="text-slate-400">
                No employee submissions available.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  <div>
                    <h4 className="text-xl font-semibold">
                      {submission.task?.title}
                    </h4>

                    <p className="mt-2 text-sm text-slate-400">
                      Submitted by:{" "}
                      {submission.submittedBy?.name}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={getFileUrl(submission.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm text-blue-400 hover:bg-slate-800 hover:text-blue-300"
                      >
                        View Submitted Work
                      </a>

                      <button
                        onClick={() =>
                          startLiveReview(submission)
                        }
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                      >
                        🎥 Start Live Review
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize">
                      AI:{" "}
                      {submission.aiStatus.replace("_", " ")}
                    </span>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize">
                      Manager:{" "}
                      {submission.managerStatus.replace(
                        "_",
                        " "
                      )}
                    </span>

                    {submission.aiStatus === "pending" && (
                      <button
                        onClick={() =>
                          verifySubmission(submission._id)
                        }
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                      >
                        Run AI Verification
                      </button>
                    )}
                  </div>
                </div>

                {submission.aiFeedback && (
                  <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <p className="text-sm font-medium">
                      AI Feedback
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {submission.aiFeedback}
                    </p>
                  </div>
                )}

                <div className="mt-5 border-t border-slate-800 pt-5">
                  <h5 className="text-lg font-semibold">
                    Manager Review
                  </h5>

                  <textarea
                    value={feedback[submission._id] || ""}
                    onChange={(e) =>
                      setFeedback((currentFeedback) => ({
                        ...currentFeedback,
                        [submission._id]: e.target.value,
                      }))
                    }
                    placeholder="Write feedback for the employee..."
                    rows="3"
                    className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-white"
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        setSelectedStatus((current) => ({
                          ...current,
                          [submission._id]: "approved",
                        }))
                      }
                      className={getButtonClass(
                        submission._id,
                        "approved"
                      )}
                    >
                      ✓ Approve
                    </button>

                    <button
                      onClick={() =>
                        setSelectedStatus((current) => ({
                          ...current,
                          [submission._id]: "rejected",
                        }))
                      }
                      className={getButtonClass(
                        submission._id,
                        "rejected"
                      )}
                    >
                      ✕ Reject
                    </button>

                    <button
                      onClick={() =>
                        setSelectedStatus((current) => ({
                          ...current,
                          [submission._id]:
                            "changes_requested",
                        }))
                      }
                      className={getButtonClass(
                        submission._id,
                        "changes_requested"
                      )}
                    >
                      ↻ Request Changes
                    </button>
                  </div>

                  {selectedStatus[submission._id] && (
                    <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-4">
                      <p className="text-sm text-slate-400">
                        Selected decision:
                      </p>

                      <p className="mt-1 font-semibold capitalize">
                        {selectedStatus[submission._id].replace(
                          "_",
                          " "
                        )}
                      </p>

                      <button
                        onClick={() =>
                          handleReview(submission._id)
                        }
                        disabled={
                          reviewing === submission._id
                        }
                        className="mt-4 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {reviewing === submission._id
                          ? "Submitting Review..."
                          : "Submit Review"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ManagerDashboard;