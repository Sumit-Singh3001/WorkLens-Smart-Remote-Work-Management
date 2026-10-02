import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load tasks");
          return;
        }

        setTasks(data.tasks);
      } catch {
        setMessage("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const getStatusStyle = (status) => {
    if (status === "approved") {
      return "bg-green-950 text-green-300";
    }

    if (status === "rejected") {
      return "bg-red-950 text-red-300";
    }

    if (status === "under_review") {
      return "bg-yellow-950 text-yellow-300";
    }

    if (status === "submitted") {
      return "bg-blue-950 text-blue-300";
    }

    return "bg-slate-800 text-slate-300";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">WorkLens</h1>

          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div>
          <h2 className="text-3xl font-bold">My Tasks</h2>

          <p className="mt-2 text-slate-400">
            View your assigned tasks and their current status.
          </p>
        </div>

        {loading && (
          <p className="mt-8 text-slate-400">
            Loading tasks...
          </p>
        )}

        {message && (
          <p className="mt-8 rounded-lg bg-red-950 px-4 py-3 text-red-300">
            {message}
          </p>
        )}

        {!loading && !message && tasks.length === 0 && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">
              No tasks assigned yet.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h3 className="text-xl font-semibold">
                    {task.title}
                  </h3>

                  <p className="mt-2 text-slate-400">
                    {task.description}
                  </p>

                  <p className="mt-4 text-sm text-slate-500">
                    Deadline:{" "}
                    {new Date(task.deadline).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      task.status
                    )}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>

                  <button
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    Open Task
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Tasks;