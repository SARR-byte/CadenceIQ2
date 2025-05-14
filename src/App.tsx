import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ContactProvider } from './contexts/ContactContext';
import LandingPage from './pages/LandingPage';
import ContactGrid from './components/contacts/ContactGrid';
import CalendarView from './components/calendar/CalendarView';
import AppLayout from './components/layout/AppLayout';
import AccessPage from './pages/AccessPage';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ContactProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/access/:token" element={<AccessPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<ContactGrid />} />
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
  );
}

export default App;