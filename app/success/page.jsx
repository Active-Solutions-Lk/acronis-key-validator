'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Mail from '@/public/images/mail.gif'

export default function Success() {
  const router = useRouter();

  // Redirect to home after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 6000);
    return () => clearTimeout(timer);
  }, [router]);

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
         We’ve sent the activation emails and keys to your email.
        </p>
        <p className="text-md text-white mb-2">
          Thanks for partnering with us! 🤝
        </p>

        {/* Redirect Prompt */}
        <p className="text-xs text-gray-500 animate-pulse">
         You’ll be redirected to the home page shortly.
        </p>

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