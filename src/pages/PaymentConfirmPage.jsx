import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function PaymentConfirmPage({ user }) {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [upiTxnId, setUpiTxnId] = useState(null);

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/payments/${paymentId}`);
      setPayment(response.data.payment);

      if (response.data.payment.status !== 'CREATED' && response.data.payment.status !== 'PENDING') {
        setStatus(response.data.payment.status);
      }
    } catch (err) {
      setError('Payment not found');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = async () => {
    setError('');
    setProcessing(true);

    try {
      // Initiate UPI payment
      const response = await axios.post(`${API_URL}/api/v1/upi/initiate`, {
        paymentId,
        payerVpa: user.vpa
      });

      setUpiTxnId(response.data.txnId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // Confirm UPI payment
      const response = await axios.post(`${API_URL}/api/v1/upi/confirm`, {
        txnId: upiTxnId,
        pin
      });

      setStatus('COMPLETED');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
      setStatus('FAILED');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your payment has been processed</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold">₹{(payment?.amount / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID</span>
              <span className="text-sm font-mono">{paymentId}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong'}</p>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setStatus(null);
                setError('');
                setPin('');
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b safe-top">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-gray-900">Confirm Payment</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-6">
        {/* Payment Details Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-2">You are paying</p>
            <p className="text-4xl font-bold text-gray-900">₹{(payment?.amount / 100).toFixed(2)}</p>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono text-gray-900">{payment?.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment ID</span>
              <span className="font-mono text-gray-900">{paymentId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">From</span>
              <span className="font-medium text-gray-900">{user.vpa}</span>
            </div>
          </div>
        </div>

        {/* Payment Actions */}
        {!upiTxnId ? (
          <button
            onClick={handleInitiatePayment}
            disabled={processing}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Proceed to Pay'}
          </button>
        ) : (
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter UPI PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength="6"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                placeholder="••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                For demo, any 4-6 digit PIN works
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={processing || pin.length < 4}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Lock className="w-5 h-5" />
              <span>{processing ? 'Confirming...' : 'Pay Securely'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500 text-sm">
          <Lock className="w-4 h-4" />
          <span>Secured by FakePay UPI</span>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirmPage;
