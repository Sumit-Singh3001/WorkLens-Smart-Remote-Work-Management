import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import SubmitWork from "./pages/SubmitWork";
import ManagerDashboard from "./pages/ManagerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/progress" element={<Progress />} />

        <Route path="/tasks" element={<Tasks />} />

        <Route path="/tasks/:id" element={<TaskDetails />} />

        <Route
          path="/tasks/:id/submit"
          element={<SubmitWork />}
        />

        <Route path="/manager" element={<ManagerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;