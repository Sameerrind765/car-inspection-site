import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookingPage from './components/BookingPage';
// import ConfirmationPage from './components/ConfirmationPage';
// import AdminDashboard from './components/AdminDashboard';
// import MobileApp from './components/MobileApp';
// import BusinessDashboard from './components/BusinessDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Routes>
          <Route path="/" element={<BookingPage />} />
          {/* <Route path="/confirmation" element={<ConfirmationPage />} /> */}
          {/* <Route path="/dashboard" element={<BusinessDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mobile" element={<MobileApp />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;