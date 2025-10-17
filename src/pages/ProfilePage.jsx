import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Wallet, CreditCard, Copy, Check, LogOut, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function ProfilePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('10000');

  useEffect(() => {
    fetchBalance();
  }, [user.userId]);

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/wallets/${user.userId}`);
      setBalance(response.data.wallet.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const handleCopyVPA = () => {
    navigator.clipboard.writeText(user.vpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTopup = async () => {
    try {
      await axios.post(`${API_URL}/api/v1/wallets/topup`, {
        userId: user.userId,
        amount: parseInt(topupAmount)
      });
      await fetchBalance();
      setShowTopup(false);
      setTopupAmount('10000');
    } catch (err) {
      console.error('Topup failed:', err);
    }
  };

  const formatAmount = (amount) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white safe-top">
        <div className="flex items-center justify-between p-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <button
            onClick={onLogout}
            className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="px-6 pb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-blue-100 text-sm">{user.phone}</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs mb-1">UPI ID</p>
                <p className="font-mono font-semibold">{user.vpa}</p>
              </div>
              <button
                onClick={handleCopyVPA}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-300" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="px-6 -mt-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Wallet Balance</h3>
            </div>
            <button
              onClick={fetchBalance}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">₹{formatAmount(balance)}</p>
              <p className="text-sm text-gray-500 mt-1">Available balance</p>
            </div>
            <button
              onClick={() => setShowTopup(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Add Money
            </button>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="px-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">User ID</p>
            <p className="font-mono text-sm text-gray-900">{user.userId}</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Email</p>
            <p className="text-sm text-gray-900">{user.email}</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">Phone</p>
            <p className="text-sm text-gray-900">{user.phone}</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-1">VPA ID</p>
            <p className="font-mono text-sm text-gray-900">{user.vpaId}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 mb-6">
        <button
          onClick={onLogout}
          className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Topup Modal */}
      {showTopup && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-md safe-bottom">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Money to Wallet</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[5000, 10000, 50000, 100000, 500000, 1000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopupAmount(amt.toString())}
                    className={`py-3 rounded-lg border-2 font-medium transition ${
                      topupAmount === amt.toString()
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    ₹{amt / 100}
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                This is fake money for testing purposes
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTopup(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTopup}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Add Money
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
