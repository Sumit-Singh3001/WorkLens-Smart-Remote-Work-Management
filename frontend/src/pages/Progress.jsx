import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Progress() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
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

        if (!response.ok) {
          setMessage(data.message || "Failed to load progress");
          return;
        }

        setProgress(data);
      } catch {
        setMessage("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-400">Loading progress...</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="rounded-lg bg-red-950 px-4 py-3 text-red-300">
          {message}
        </p>
      </div>
    );
  }

  const progressCards = [
    { title: "Total Tasks", value: progress?.total ?? 0 },
    { title: "Pending", value: progress?.pending ?? 0 },
    { title: "Submitted", value: progress?.submitted ?? 0 },
    { title: "Under Review", value: progress?.underReview ?? 0 },
    { title: "Approved", value: progress?.approved ?? 0 },
    { title: "Rejected", value: progress?.rejected ?? 0 },
  ];

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
        <h2 className="text-3xl font-bold">Work Progress</h2>

        <p className="mt-2 text-slate-400">
          Track your tasks from assignment to final decision.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {progressCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm text-slate-400">
                {card.title}
              </p>

              <p className="mt-2 text-4xl font-bold">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">
            Progress Summary
          </h3>

          <p className="mt-3 text-slate-400">
            You currently have {progress?.total ?? 0} total tasks,
            with {progress?.approved ?? 0} approved and{" "}
            {progress?.rejected ?? 0} rejected.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Progress;