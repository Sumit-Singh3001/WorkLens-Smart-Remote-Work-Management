import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_URL from "../api";

function SubmitWork() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("task", id);
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/submissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Submission failed");
        setLoading(false);
        return;
      }

      setMessage("Work submitted successfully!");

      setTimeout(() => {
        navigate(`/tasks/${id}`);
      }, 1000);
    } catch {
      setMessage("Unable to connect to the server");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">WorkLens</h1>

          <button
            onClick={() => navigate(`/tasks/${id}`)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            ← Back to Task
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-3xl font-bold">Submit Your Work</h2>

          <p className="mt-2 text-slate-400">
            Upload your completed work for AI verification and manager
            review.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label className="mb-3 block text-sm font-medium">
              Select File
            </label>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm"
            />

            {file && (
              <p className="mt-3 text-sm text-slate-400">
                Selected: {file.name}
              </p>
            )}

            {message && (
              <p className="mt-5 rounded-lg bg-slate-800 px-4 py-3 text-sm">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Work"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default SubmitWork;