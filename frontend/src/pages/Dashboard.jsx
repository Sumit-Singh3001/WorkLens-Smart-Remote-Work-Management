import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/tasks/progress",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setProgress(data);
        }
      } catch {
        console.log("Unable to load progress");
      }
    };

    fetchProgress();
  }, [navigate, storedUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">WorkLens</h1>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold">
                {user?.name || "User"}
              </p>

              <p className="text-xs capitalize text-slate-400">
                {user?.role || "employee"}
              </p>
            </div>

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
        <div>
          <h2 className="text-3xl font-bold">
            Welcome, {user?.name || "User"} 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Here's an overview of your work activity.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Tasks</p>
            <p className="mt-2 text-3xl font-bold">
              {progress?.total ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Pending</p>
            <p className="mt-2 text-3xl font-bold">
              {progress?.pending ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Submitted</p>
            <p className="mt-2 text-3xl font-bold">
              {progress?.submitted ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Under Review</p>
            <p className="mt-2 text-3xl font-bold">
              {progress?.underReview ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Approved</p>
            <p className="mt-2 text-3xl font-bold">
              {progress?.approved ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-semibold">My Tasks</h3>

            <p className="mt-2 text-sm text-slate-400">
              View assigned tasks, deadlines, and submission status.
            </p>

            <button
              onClick={() => navigate("/tasks")}
              className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950"
            >
              View Tasks
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-semibold">Work Progress</h3>

            <p className="mt-2 text-sm text-slate-400">
              Track your work from assignment to final approval.
            </p>

            <button
              onClick={() => navigate("/progress")}
              className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950"
            >
              View Progress
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;