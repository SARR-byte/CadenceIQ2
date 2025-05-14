import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import { toast } from 'react-toastify';
import { createCheckoutSession } from '../lib/stripe';
import { useAuth } from '../contexts/AuthContext';

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setLoading(true);
    try {
      const sessionUrl = await createCheckoutSession(user, 'price_H5ggYwtDq123'); // Replace with your actual price ID
      window.location.href = sessionUrl;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Network className="h-8 w-8 text-charcoal-500 mr-2" />
            <span className="text-2xl font-bold text-gray-900">CadenceIQ</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full">
          <div className="bg-charcoal-600 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Complete Your Purchase</h2>
            <p className="mt-2 text-charcoal-100">
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
              
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                  loading ? 'bg-charcoal-400' : 'bg-charcoal-600 hover:bg-charcoal-700'
                } focus:outline-none focus:ring-2 focus:ring-charcoal-500 focus:ring-offset-2 transition-colors`}
              >
                {loading ? 'Processing...' : 'Pay $9.95'}
              </button>
              
              <p className="mt-4 text-xs text-gray-500 text-center">
                Secure payment processing by Stripe. Your card information is never stored.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};