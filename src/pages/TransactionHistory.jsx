import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCw, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function TransactionHistory({ user }) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, [user.userId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/upi/history/${user.userId}`, {
        params: { limit: 100 }
      });
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return (amount / 100).toFixed(2);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filter === 'sent') return txn.payerVpa === user.vpa;
    if (filter === 'received') return txn.payeeVpa === user.vpa;
    return true;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, txn) => {
    const date = new Date(txn.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(txn);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b safe-top sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Transaction History</h1>
          <button
            onClick={fetchTransactions}
            className="w-10 h-10 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-t">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-3 text-sm font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`flex-1 py-3 text-sm font-medium ${
              filter === 'sent'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`flex-1 py-3 text-sm font-medium ${
              filter === 'received'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Received
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">No transactions found</p>
            <p className="text-gray-400 text-xs mt-1">
              {filter === 'all'
                ? 'Your transactions will appear here'
                : `No ${filter} transactions yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, txns]) => (
              <div key={date}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                  {new Date(date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <div className="bg-white rounded-2xl shadow-sm divide-y">
                  {txns.map((txn) => {
                    const isSent = txn.payerVpa === user.vpa;
                    return (
                      <div key={txn.txnId} className="p-4">
                        <div className="flex items-center justify-between mb-2">
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
                                {isSent ? 'Paid to' : 'Received from'}
                              </p>
                              <p className="text-xs text-gray-600 font-mono">
                                {isSent ? txn.payeeVpa : txn.payerVpa}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold text-lg ${
                              isSent ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {isSent ? '-' : '+'}₹{formatAmount(txn.amount)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pl-13">
                          <span>{formatDate(txn.createdAt)}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            txn.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-700'
                              : txn.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {txn.status}
                          </span>
                        </div>

                        {txn.upiRef && (
                          <div className="mt-2 text-xs text-gray-500 pl-13">
                            UTR: {txn.upiRef}
                          </div>
                        )}

                        {txn.note && (
                          <div className="mt-2 text-xs text-gray-600 pl-13 italic">
                            "{txn.note}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;
