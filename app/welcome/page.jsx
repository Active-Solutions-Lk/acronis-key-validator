'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { userRegister } from '../actions/userRegister'
import { fetchPackage } from '../actions/fetchPackage'
import { SendMail } from '../actions/sendMail' // Import SendMail
import { Skeleton } from '@/components/ui/skeleton' // Adjust path based on your setup
import { Suspense } from 'react'

export default function Welcome () {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    customer: '',
    address: '',
    name: '',
    email: '',
    tel: '',
    city: '',
    code: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [packageName, setPackage] = useState('')
  const [isLoadingPackage, setIsLoadingPackage] = useState(true)

  // Sample city list
  const cities = [
    { value: 'colombo', label: 'Colombo' },
    { value: 'kandy', label: 'Kandy' },
    { value: 'galle', label: 'Galle' },
    { value: 'jaffna', label: 'Jaffna' },
    { value: 'negombo', label: 'Negombo' }
  ]

  // Capture code from URL and fetch package on mount
  useEffect(() => {
    const code = searchParams.get('code')
    console.log('Code from URL:', code)
    if (code) {
      setFormData(prev => ({ ...prev, code }))
      const loadPackage = async () => {
        try {
          const result = await fetchPackage(code)
          console.log('Package fetch result:', result)
          if (result.success) {
            setPackage(result.packageName || 'acronis key')
          } else {
            setError('Session timeout. Please verify code again')
            setTimeout(() => router.push('/'), 6000)
          }
        } catch (err) {
          setError('Error loading package.')
        } finally {
          setIsLoadingPackage(false)
        }
      }
      loadPackage()
    } else {
      // setTimeout(() => router.push('/'), 20)
      setIsLoadingPackage(false)
    }
  }, [searchParams])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCitySelect = value => {
    setFormData(prev => ({ ...prev, city: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Calculate dates
    const actDate = new Date()
    const endDate = new Date()
    endDate.setFullYear(actDate.getFullYear() + 1)

    // Create data with dates
    const submitData = {
      ...formData,
      actDate,
      endDate
    }

    try {
      const result = await userRegister(submitData)
      if (result.success) {
        setSuccess('User data submitted successfully!')
        setFormData({
          customer: '',
          address: '',
          name: '',
          email: '',
          tel: '',
          city: '',
          code: formData.code
        })
        try {
          const mailResponse = await SendMail(formData.code)
          if (!mailResponse.success) {
            throw new Error(mailResponse.error || 'Failed to send email')
          }
          if (mailResponse.success) {
            setSuccess('User registered and email sent successfully!');
            router.push('/success');
          }
        } catch (mailError) {
          console.error('Email sending error:', {
            error: mailError.message,
            stack: mailError.stack,
            code: formData.code,
            timestamp: new Date().toISOString()
          })
          setError('User registered, but failed to send email..')
        }
      } else {
        console.error('Submission error:', {
          message: result.error,
          formData: submitData, // Log updated data for debugging
          timestamp: new Date().toISOString()
        })
        setError(
          result.error === 'Name and email are required'
            ? 'Please fill in the required Name and Email fields.'
            : result.error === 'No record found for the provided code'
            ? 'Invalid or expired code. Please try again.'
            : 'Failed to submit data. Please try again later.'
        )
      }
    } catch (err) {
      console.error('Unexpected submission error:', {
        error: err.message,
        stack: err.stack,
        formData: submitData, // Log updated data
        timestamp: new Date().toISOString()
      })
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingPackage) {
    return (
      <div className='flex items-center justify-center bg-transparent'>
        <Loader2 className='h-64 w-64 animate-spin' />
      </div>
    )
  }

  return (
    <main className='bg-transparent'>
      <Suspense
        fallback={
          <div className='container mx-auto px-4 py-8'>
            <Skeleton className='h-12 w-full mb-4' />
            <Skeleton className='h-64 w-full mb-4' />
            <Skeleton className='h-32 w-full' />
          </div>
        }
      >
        <div className='flex items-center justify-center bg-transparent'>
          <div className='bg-transparent rounded-lg shadow-lg w-full max-w-2xl'>
            <h4 className='mb-4 text-center'>
              Fill following details to enable {packageName} package
            </h4>
            <form onSubmit={handleSubmit} className='space-y-3'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label
                    htmlFor='customer'
                    className='block text-sm font-medium text-gray-100'
                  >
                    Company Name
                  </label>
                  <Input
                    type='text'
                    id='customer'
                    name='customer'
                    value={formData.customer}
                    onChange={handleChange}
                    className='mt-1 text-white'
                  />
                </div>
                <div>
                  <label
                    htmlFor='address'
                    className='block text-sm font-medium text-gray-100'
                  >
                    Address
                  </label>
                  <Input
                    type='text'
                    id='address'
                    name='address'
                    value={formData.address}
                    onChange={handleChange}
                    className='mt-1'
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-100'
                  >
                    Name
                  </label>
                  <Input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className='mt-1'
                  />
                </div>
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-100'
                  >
                    Email
                  </label>
                  <Input
                    type='email'
                    id='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className='mt-1'
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label
                    htmlFor='tel'
                    className='block text-sm font-medium text-gray-100'
                  >
                    Telephone
                  </label>
                  <Input
                    type='tel'
                    id='tel'
                    name='tel'
                    value={formData.tel}
                    onChange={handleChange}
                    className='mt-1'
                  />
                </div>
                <div>
                  <label
                    htmlFor='city'
                    className='block text-sm font-medium text-gray-100 mb-1'
                  >
                    City
                  </label>
                  <Combobox
                    className='mt-2'
                    title='City'
                    cities={cities}
                    value={formData.city}
                    onValueChange={handleCitySelect}
                  />
                </div>
              </div>
              {error && (
                <p className='text-red-500 text-sm text-center'>{error}</p>
              )}
              {success && (
                <p className='text-green-500 text-sm text-center'>{success}</p>
              )}
              <Button
                type='submit'
                className='w-full mt-3'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Submitting...
                  </div>
                ) : (
                  'Submit'
                )}
              </Button>
            </form>
          </div>
        </div>
      </Suspense>
    </main>
  )
}
