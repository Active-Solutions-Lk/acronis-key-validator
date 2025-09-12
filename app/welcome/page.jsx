'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { userRegister } from '../actions/userRegister'
import { validateQRCode } from '../actions/validateQRCode'
import { SendMail } from '../actions/sendMail'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import AllCities from '../actions/allCities' // Import the AllCities action

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
  const [cities, setCities] = useState([]) // State for dynamic cities
  const [isLoadingCities, setIsLoadingCities] = useState(true) // Loading state for cities

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const result = await AllCities()
        if (result.success) {
          // Transform the cities data to match the Combobox format
          const transformedCities = result.cities.map(city => ({
            value: city.id.toString(), // Convert id to string for the value
            label: `${city.city}` // Format as "City, District"
          }))
          setCities(transformedCities)
        } else {
          console.error('Failed to fetch cities:', result.error)
          // Fallback to hardcoded cities if API fails
          setCities([
            { value: 'colombo', label: 'Colombo' },
            { value: 'kandy', label: 'Kandy' },
            { value: 'galle', label: 'Galle' },
            { value: 'jaffna', label: 'Jaffna' },
            { value: 'negombo', label: 'Negombo' }
          ])
        }
      } catch (err) {
        console.error('Error fetching cities:', err)
        // Fallback to hardcoded cities if API fails
        setCities([
          { value: 'colombo', label: 'Colombo' },
          { value: 'kandy', label: 'Kandy' },
          { value: 'galle', label: 'Galle' },
          { value: 'jaffna', label: 'Jaffna' },
          { value: 'negombo', label: 'Negombo' }
        ])
      } finally {
        setIsLoadingCities(false)
      }
    }

    fetchCities()
  }, [])

  // Capture code from URL and validate it on mount
  useEffect(() => {
    const code = searchParams.get('code')
    console.log('Code from URL:', code)
    if (code) {
      setFormData(prev => ({ ...prev, code }))
      const validateCode = async () => {
        try {
          // Validate the code (which is actually the ID) first
          const validationResult = await validateQRCode(code)
          console.log('Validation result:', validationResult)
          
          if (validationResult.status === 200) {
            // If validation is successful, we can get the package name from the validation result
            setPackage(validationResult.data?.pkg?.name || 'acronis key')
          } else {
            // If validation fails, redirect to home page
            setError('Invalid or expired code. Please try again.')
            setTimeout(() => router.push('/'), 3000)
          }
        } catch (err) {
          console.error('Error validating code:', err)
          setError('Error validating code.')
          // Redirect to home page after a delay
          setTimeout(() => router.push('/'), 3000)
        } finally {
          setIsLoadingPackage(false)
        }
      }
      validateCode()
    } else {
      // No code in URL, redirect to home page
      router.push('/')
      setIsLoadingPackage(false)
    }
  }, [searchParams, router])

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
      console.log('User register result:', result) // Add logging for debugging
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
            setSuccess('User registered and email sent successfully!')
            router.push('/success')
          }
        } catch (mailError) {
          console.error('Email sending error:', {
            error: mailError.message,
            stack: mailError.stack,
            code: formData.code,
            timestamp: new Date().toISOString()
          })
          // Still redirect to success page even if email fails
          router.push('/success')
        }
      } else {
        console.error('Submission error:', {
          message: result.error,
          status: result.status,
          formData: submitData,
          timestamp: new Date().toISOString()
        })
        setError(
          result.error === 'Name and email are required'
            ? 'Please fill in the required Name and Email fields.'
            : result.error === 'Invalid code provided'
            ? 'Invalid or expired code. Please try again.'
            : result.error === 'Code is required'
            ? 'Code is missing. Please try again.'
            : result.error || 'Failed to submit data. Please try again later.'
        )
      }
    } catch (err) {
      console.error('Unexpected submission error:', {
        error: err.message,
        stack: err.stack,
        formData: submitData,
        timestamp: new Date().toISOString()
      })
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingPackage || isLoadingCities) {
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