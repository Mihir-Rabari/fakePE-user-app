import { useState } from 'react';
import { Wallet, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function SetupAccount({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vpaUsername: '',
    initialBalance: 10000
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Generate user ID
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create VPA
      const vpa = `${formData.vpaUsername}@fakepay`;
      const vpaResponse = await axios.post(`${API_URL}/api/v1/upi/vpa`, {
        userId,
        vpa
      });

      // Top up wallet
      await axios.post(`${API_URL}/api/v1/wallets/topup`, {
        userId,
        amount: formData.initialBalance
      });

      // Save user data
      const userData = {
        userId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        vpa: vpaResponse.data.vpa.vpa,
        vpaId: vpaResponse.data.vpa.vpaId
      };

      onComplete(userData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome to FakePay</h1>
          <p className="text-blue-100 text-sm">Your UPI Payment App</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Create UPI ID
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={formData.vpaUsername}
                  onChange={(e) => setFormData({ ...formData, vpaUsername: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                  required
                  pattern="[a-z0-9]+"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="yourname"
                />
                <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                  @fakepay
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose a unique UPI ID (letters and numbers only)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Wallet Balance
              </label>
              <select
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5000}>₹50 (Demo)</option>
                <option value={10000}>₹100 (Demo)</option>
                <option value={50000}>₹500 (Demo)</option>
                <option value={100000}>₹1,000 (Demo)</option>
                <option value={500000}>₹5,000 (Demo)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This is fake money for testing
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you agree to the FakePay Terms of Service
          </p>
        </form>
      </div>
    </div>
  );
}

export default SetupAccount;
