import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

function ScanQRPage({ user }) {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setScanning(true);
      setError('');

      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const onScanSuccess = (decodedText) => {
    console.log('QR Code scanned:', decodedText);
    processQRCode(decodedText);
  };

  const onScanError = (err) => {
    // Ignore scan errors (they happen frequently)
  };

  const processQRCode = (qrData) => {
    try {
      // Check if it's a payment URL
      if (qrData.includes('/pay/')) {
        const paymentId = qrData.split('/pay/').pop().split('?')[0];
        stopScanner();
        navigate(`/confirm/${paymentId}`);
      }
      // Check if it's a UPI intent
      else if (qrData.startsWith('upi://pay')) {
        const url = new URL(qrData);
        const params = new URLSearchParams(url.search);
        const paymentId = params.get('tr'); // Transaction ID
        
        if (paymentId) {
          stopScanner();
          navigate(`/confirm/${paymentId}`);
        } else {
          setError('Invalid UPI QR code');
        }
      } else {
        setError('Invalid payment QR code');
      }
    } catch (err) {
      console.error('Error processing QR:', err);
      setError('Failed to process QR code');
    }
  };

  const handleManualEntry = (e) => {
    e.preventDefault();
    if (manualUrl) {
      processQRCode(manualUrl);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (html5QrCodeRef.current) {
        const result = await html5QrCodeRef.current.scanFile(file, true);
        processQRCode(result);
      }
    } catch (err) {
      setError('Could not read QR code from image');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent safe-top">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white font-semibold">Scan QR Code</h1>
          <label className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center cursor-pointer">
            <ImageIcon className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Scanner */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
          
          {/* Scanning Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64">
              {/* Corner borders */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-32 left-4 right-4 bg-red-500 text-white p-4 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Manual Entry */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 safe-bottom">
        <h3 className="font-semibold text-gray-900 mb-3">Enter Payment Link</h3>
        <form onSubmit={handleManualEntry} className="flex space-x-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste payment URL or UPI intent"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Go
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Position the QR code within the frame to scan automatically
        </p>
      </div>
    </div>
  );
}

export default ScanQRPage;
