import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, History, User, Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function HomePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchBalance();
    fetchRecentTransactions();
  }, [user.userId]);

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/wallets/${user.userId}`);
      setBalance(response.data.wallet.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/upi/history/${user.userId}`, {
        params: { limit: 5 }
      });
      setRecentTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const formatAmount = (amount) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Balance */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white safe-top">
        <div className="px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 text-sm">Welcome back</p>
              <h1 className="text-xl font-bold">{user.name}</h1>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm">Wallet Balance</p>
              <button
                onClick={fetchBalance}
                className="p-1 hover:bg-white/10 rounded-full transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">₹{formatAmount(balance)}</span>
            </div>
            <p className="text-blue-100 text-xs mt-1">{user.vpa}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-6 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/scan')}
              className="flex flex-col items-center p-4 rounded-xl hover:bg-blue-50 transition"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Scan className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Scan QR</span>
            </button>

            <button
              onClick={() => navigate('/history')}
              className="flex flex-col items-center p-4 rounded-xl hover:bg-blue-50 transition"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <History className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">History</span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center p-4 rounded-xl hover:bg-blue-50 transition"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          {recentTransactions.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-blue-600 font-medium"
            >
              View All
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <History className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">No transactions yet</p>
            <p className="text-gray-400 text-xs mt-1">Scan a QR code to make your first payment</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {recentTransactions.map((txn) => {
              const isSent = txn.payerVpa === user.vpa;
              return (
                <div key={txn.txnId} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSent ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {isSent ? (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {isSent ? txn.payeeVpa : txn.payerVpa}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      isSent ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isSent ? '-' : '+'}₹{formatAmount(txn.amount)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      txn.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-700'
                        : txn.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scan Button (Fixed) */}
      <div className="fixed bottom-6 left-0 right-0 px-6 safe-bottom">
        <button
          onClick={() => navigate('/scan')}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg flex items-center justify-center space-x-2 hover:shadow-xl transition"
        >
          <Scan className="w-5 h-5" />
          <span>Scan & Pay</span>
        </button>
      </div>
    </div>
  );
}

export default HomePage;
