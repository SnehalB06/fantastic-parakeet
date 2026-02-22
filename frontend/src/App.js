import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// pages & components
import AdminPanel from './pages/AdminPanel';
import PMDashboard from './pages/PMDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Home from './pages/Home';
import Timesheet from './pages/Timesheet';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import AddProjectPage from './pages/AddProjectPage';
import AddProjectClientPage from './pages/AddProjectClientPage';
function AdminOrClientRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="loading-spinner"><p>Loading...</p></div>;
  }
  if (!user || (user.role !== "ADMIN" && user.role !== "CLIENT")) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner"><p>Loading...</p></div>;
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PMRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner"><p>Loading...</p></div>;
  }

  if (!user || user.role !== "PM") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ClientRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner"><p>Loading...</p></div>;
  }

  if (!user || user.role !== "CLIENT") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />
            <Route 
              path="/pm-dashboard" 
              element={
                <PMRoute>
                  <PMDashboard />
                </PMRoute>
              } 
            />
            <Route 
              path="/client-dashboard" 
              element={
                <ClientRoute>
                  <ClientDashboard />
                </ClientRoute>
              } 
            />
            <Route 
              path="/timesheet" 
              element={
                <ProtectedRoute>
                  <Timesheet />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/add-project"
              element={
                <AdminOrClientRoute>
                  <AddProjectPage />
                </AdminOrClientRoute>
              }
            />
            <Route
              path="/client/add-project"
              element={
                <ClientRoute>
                  <AddProjectClientPage />
                </ClientRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
