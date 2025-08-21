'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { validateQRCode } from './actions/validateQRCode'
import ActiveLogo from '@/public/images/activeLogo.png'
import AcronisLogo from '@/public/images/acronisLogo.png'
import Image from 'next/image'

export default function Home () {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const codeFromUrl = searchParams.get('code')

  useEffect(() => {
    if (codeFromUrl) {
      validatePassword(codeFromUrl)
    }
  }, [codeFromUrl])

  const validatePassword = async code => {
    setIsLoading(true)
    setMessage('')
    setShowContact(false)
    setPassword(code)
    try {
      const result = await validateQRCode(code)
      if (result.status === 200) {
        router.push(`/welcome?code=${encodeURIComponent(code)}`)
        setMessage(result.message)
      } else {
        setMessage(result.message)
        setShowContact(true)
      }
    } catch (error) {
      setMessage('Error validating password')
      setShowContact(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    await validatePassword(password)
  }

  return (
   <div>
      
      {/* Main Content */}
      <main className='flex-1 flex items-start justify-center '>
        <div className='w-full items-center justify-center '>
          {/* Validation Form */}
          <div className='flex w-full justify-center items-center '>
            <div className='relative w-full max-w-3xl'>
              <div className='absolute inset-0  rounded-3xl blur-sm'></div>
              <div className='relative  rounded-2xl border border-white'>
                <div className='relative'>
                  <div className='flex items-center'>
                    <input
                      type='text'
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className='flex-1 px-8 bg-transparent text-white  text-md focus:outline-none'
                      placeholder={password || 'Enter Validation Key'}
                      disabled={isLoading}
                      onKeyDown={e => {
                        if (
                          e.key === 'Enter' &&
                          password.trim() &&
                          !isLoading
                        ) {
                          handleSubmit(e)
                        }
                      }}
                    />

                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !password.trim()}
                      className='mr-2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group'
                    >
                      {isLoading ? (
                        <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                      ) : (
                        <svg
                          className='w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M5 13l4 4L19 7'
                          ></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Message */}
          {isLoading && (
            <div>
              <div className='text-center mt-8'>
                <p className='text-white text-lg animate-pulse'>
                  Validating...
                </p>
              </div>
            </div>
          )}

          {/* Validation Result */}
          {message && !isLoading && (
            <div className='flex w-full justify-center items-center '>
              <div
                className={`mt-8  max-w-md  w-full p-1 justify-center items-center rounded-xl   transition-all duration-500 ${
                  message.includes('Error') ||
                  message.includes('Invalid') ||
                  message.includes('Server error')
                    ? 'border-red-400/30 bg-transparent text-red-500'
                    : 'border-green-400/30 bg-transparent text-green-200'
                }`}
              >
                <p className='text-center text-lg font-medium'>{message}</p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {showContact && (
            <div className='mt-8 text-center space-y-4 animate-fadeIn'>
              <p className='text-white/60'>Need assistance?</p>
              <div className='space-y-2'>
                <div className='flex items-center justify-center space-x-2 text-white/80 hover:text-white transition-colors duration-300'>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    ></path>
                  </svg>
                  <a
                    href='mailto:support@activesolutions.lk'
                    className='hover:underline'
                  >
                    support@activesolutions.lk
                  </a>
                </div>
                <div className='flex items-center justify-center space-x-2 text-white/80 hover:text-white transition-colors duration-300'>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    ></path>
                  </svg>
                  <a href='tel:+94112345678' className='hover:underline'>
                    +94 11 234 5678
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Footer */}
     
      {/* Custom styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
