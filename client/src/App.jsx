import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import Projects from './pages/Projects';

// ProtectedRoute → checks if user is logged in
// If not logged in → redirects to /login page
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <span className="text-4xl">🐝</span>
        <p className="text-gray-600 mt-2">Loading TaskHive...</p>
      </div>
    </div>
  );

  // If user exists → show page, else → redirect to login
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      {/* Public routes → no login needed */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes → login required */}
      {/* Layout wraps all → gives sidebar to every page */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* index → / redirects to /dashboard */}
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="teams" element={<Teams />} />
        <Route path="projects" element={<Projects />} />
      </Route>

      {/* Any unknown URL → go to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;