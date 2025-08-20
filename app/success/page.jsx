'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Success() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(true);

  useEffect(() => {
    if (isCountdownActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }
  }, [countdown, isCountdownActive]);

  const openEmailClient = () => {
    // Try to open default email client
    window.location.href = 'mailto:';
  };

  const handleOpenMailClick = () => {
    setIsCountdownActive(false);
    openEmailClient();
  };

  return (
    <div className="flex items-center justify-center bg-transparent">
      <div className="bg-transparent rounded-lg shadow-xl max-w-xl w-full text-center">
        {/* Animated Checkmark */}
        <div className="relative flex items-center justify-center mb-6">
           <img
            src='/images/mail.gif'
            alt="Email Sent"
            className="w-64 h-40 rounded-lg bg-black shadow-black "
          />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-white mb-2"> Check your mail inbox!</h1>
        <p className="text-lg text-white mb-2">
         We've sent the activation emails and keys to your email.
        </p>
        <p className="text-md text-white mb-6">
          Thanks for partnering with us! 🤝
        </p>

        {/* Open Mail Button with Countdown */}
        <div className="mt-8">
          <button
            onClick={handleOpenMailClick}
            className="relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
            disabled={false}
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
            <span>
              {isCountdownActive 
                ? `Open Mail (${countdown}s)` 
                : 'Open Mail App'
              }
            </span>
            
            {/* Countdown Progress Ring */}
            {isCountdownActive && (
              <div className="absolute -top-1 -right-1 w-6 h-6">
                <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${(10 - countdown) * 6.28} 62.8`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {countdown}
                  </span>
                </div>
              </div>
            )}
          </button>
          
          <p className="text-sm text-gray-300 mt-3">
            {isCountdownActive 
              ? "The mail app will open automatically, or click the button to open it now"
              : "Click to open your default email application"
            }
          </p>
        </div>

        {/* Auto-open after countdown */}
        {countdown === 0 && (
          <div className="hidden">
            {openEmailClient()}
          </div>
        )}

        {/* Custom CSS for Animation */}
        <style jsx>{`
          .animate-checkmark {
            animation: drawCheckmark 0.5s ease-in-out forwards;
          }
          @keyframes drawCheckmark {
            0% {
              stroke-dasharray: 0, 100;
              stroke-dashoffset: 100;
            }
            100% {
              stroke-dasharray: 100, 0;
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}