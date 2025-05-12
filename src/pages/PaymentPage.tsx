import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Network } from 'lucide-react';
import { Link } from 'react-router-dom';

// This would be your actual publishable key from your Stripe Dashboard
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call your backend to create a checkout session
      // For this demo, we'll simulate a successful payment after a delay
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError('Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Network className="h-8 w-8 text-blue-500 mr-2" />
            <span className="text-2xl font-bold text-gray-900">CadenceIQ</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
          {!success ? (
            <>
              <div className="bg-blue-600 p-6 text-center">
                <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
                <p className="mt-2 text-blue-100">
                  You're just one step away from better contact management
                </p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">CadenceIQ - Contact Management</h3>
                  <div className="flex justify-between text-gray-700">
                    <span>One-time purchase</span>
                    <span className="font-semibold">$9.95</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Total</span>
                    <span className="text-xl font-bold text-gray-900">$9.95</span>
                  </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                      loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
                  >
                    {loading ? 'Processing...' : 'Pay $9.95'}
                  </button>
                  
                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Secure payment processing by Stripe. Your card information is never stored.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. You now have access to CadenceIQ.
              </p>
              
              <Link
                to="/app/contacts"
                className="inline-block py-3 px-6 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;