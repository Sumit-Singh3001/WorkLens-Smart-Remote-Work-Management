import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">WorkLens</h1>

          <button
            onClick={() => navigate("/login")}
            className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-950"
          >
            Get Started
          </button>
        </nav>

        <main className="flex min-h-[80vh] flex-col items-center justify-center text-center">
          <p className="mb-4 text-sm font-medium text-slate-400">
            SMART REMOTE WORK MANAGEMENT
          </p>

          <h2 className="max-w-3xl text-5xl font-bold leading-tight">
            Make remote work
            <span className="text-slate-400"> visible and verifiable.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg text-slate-400">
            Assign tasks, verify work, review progress, and collaborate
            with your team from one platform.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-8 rounded-lg bg-white px-6 py-3 font-semibold text-slate-950"
          >
            Start with WorkLens
          </button>
        </main>
      </div>
    </div>
  );
}

export default Landing;