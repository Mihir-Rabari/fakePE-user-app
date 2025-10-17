import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import ScanQRPage from './pages/ScanQRPage';
import PaymentConfirmPage from './pages/PaymentConfirmPage';
import TransactionHistory from './pages/TransactionHistory';
import ProfilePage from './pages/ProfilePage';
import SetupAccount from './pages/SetupAccount';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('fakepay_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('fakepay_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fakepay_user');
  };

  // If no user, show setup
  if (!user) {
    return <SetupAccount onComplete={saveUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={logout} />} />
        <Route path="/scan" element={<ScanQRPage user={user} />} />
        <Route path="/confirm/:paymentId" element={<PaymentConfirmPage user={user} />} />
        <Route path="/history" element={<TransactionHistory user={user} />} />
        <Route path="/profile" element={<ProfilePage user={user} onLogout={logout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
