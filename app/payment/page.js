'use client';
import { useState, useEffect } from 'react';
import PayPalButton from '@/components/Paypal/PayPalButton';

export default function PaymentPage() {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Check if we're returning from PayPal
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const payerId = urlParams.get('PayerID');

    if (token && payerId) {
      completePayment(token, payerId);
    }
  }, []);

  const completePayment = async (token, payerId) => {
    try {
      setPaymentStatus('processing');
      
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, payerId }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'COMPLETED') {
        setPaymentStatus('success');
        setOrderDetails(result);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment completion error:', error);
      setPaymentStatus('error');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('redirecting');
  };

  const handlePaymentError = (error) => {
    setPaymentStatus('error');
    console.error('Payment error:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8">
          <h1 className="text-3xl font-bold text-white text-center">
            AidHandy Checkout
          </h1>
          <p className="text-blue-100 text-center mt-2">
            Sandbox Testing Environment
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Premium Service Plan
            </h2>
            <p className="text-gray-600 mb-4">
              Access all premium features including advanced analytics, priority support, and extended storage.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">$99.00</span>
              <span className="text-sm text-gray-500">USD</span>
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-800 font-medium">Processing your payment...</p>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && orderDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Transaction ID:</strong> {orderDetails.id}</p>
                <p><strong>Amount:</strong> ${orderDetails.amount}</p>
                <p><strong>Status:</strong> {orderDetails.status}</p>
                <p className="mt-3">Thank you for your purchase!</p>
              </div>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <p className="text-red-800 font-medium">Payment failed. Please try again.</p>
              </div>
            </div>
          )}

          {/* PayPal Button */}
          {!paymentStatus || paymentStatus === 'redirecting' ? (
            <PayPalButton
              amount="99.00"
              currency="USD"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Make Another Payment
            </button>
          )}

          {/* Sandbox Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <p className="text-yellow-800 text-sm font-medium">Sandbox Mode</p>
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              Use PayPal test accounts for payment processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}