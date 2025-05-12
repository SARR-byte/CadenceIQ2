import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  useEffect(() => {
    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false };
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.20/dist/unicornStudio.umd.js";
      script.onload = () => {
        if (!window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <header className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-end">
        <Link 
          to="/payment" 
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md transition-colors"
        >
          Buy Now
        </Link>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 max-w-6xl">
          <Link 
            to="/payment" 
            className="bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-md text-white text-lg font-medium transition-colors whitespace-nowrap"
          >
            Try it for $9.95
          </Link>
          <p className="text-2xl md:text-3xl text-gray-300 leading-relaxed">
            A simple yet powerful contact cadence system to help you book more meetings.
          </p>
        </div>
        
        <div 
          data-us-project="PFxfez3fdaD7pRBj3CLH" 
          style={{
            width: '1360px',
            height: '680px',
            background: '#151515',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transform: 'scale(0.85)'
          }}
        />
        
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Why CadenceIQ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-lg">Structured outreach process with proven 4-step cadence</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-lg">AI-powered insights to personalize your outreach</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-lg">Calendar integration for follow-up scheduling</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-lg">Track progress with real-time statistics</p>
            </div>
          </div>
        </div>
      </main>

      <div className="container mx-auto px-4 py-4 text-center">
        <span className="inline-block bg-gray-800 rounded-full px-4 py-2 text-sm">
          One-time payment • No recurring fees
        </span>
      </div>
    </div>
  );
};

export default LandingPage;