import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { ContactProvider } from './contexts/ContactContext';
import LandingPage from './pages/LandingPage';
import PaymentPage from './pages/PaymentPage';
import ContactGrid from './components/contacts/ContactGrid';
import CalendarView from './components/calendar/CalendarView';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <ContactProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/contacts" replace />} />
              <Route path="contacts" element={<ContactGrid />} />
              <Route path="calendar" element={<CalendarView />} />
            </Route>
          </Routes>
          <ToastContainer 
            position="bottom-right"
            theme="dark"
            toastClassName="bg-charcoal-800 text-white"
          />
        </Router>
      </ContactProvider>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default App;