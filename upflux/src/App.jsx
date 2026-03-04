import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TakeQuiz from "./pages/TakeQuiz.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import Performance from "./pages/Performance.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AITutor from "./pages/AITutor.jsx";
import Challenges from "./pages/Challenges.jsx";
import StudyPlanner from "./pages/StudyPlanner.jsx";
import ConceptModule from "./pages/ConceptModule.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <TakeQuiz />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <Performance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-tutor"
        element={
          <ProtectedRoute>
            <AITutor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <Challenges />
          </ProtectedRoute>
        }
      />

      <Route
        path="/study-planner"
        element={
          <ProtectedRoute>
            <StudyPlanner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/concept/:topic"
        element={
          <ProtectedRoute>
            <ConceptModule />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;