import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PaymentPage from './pages/PaymentPage';
import ContactGrid from './components/contacts/ContactGrid';
import CalendarView from './components/calendar/CalendarView';
import AppLayout from './components/layout/AppLayout';
import { ContactProvider } from './contexts/ContactContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ContactProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/app" element={<AppLayout />}>
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
      </ContactProvider>
    </Router>
  );
}

export default App;