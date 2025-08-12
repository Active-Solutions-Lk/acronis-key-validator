import Image from 'next/image';

export default function Header() {
  return (
    <header className='relative z-10 flex justify-center pt-4'>
      <div className='text-center'>
        <div className='flex items-center justify-center'>
          <Image
            src='/images/activeLogo.png'
            alt='Active Solutions Logo'
            width={150}
            height={64}
            className='h-16 w-auto '
            priority
          />
        </div>
        <div className='text-center mb-12'>
          <h1 className='text-6xl font-light text-white mb-8 tracking-wide'>
            Acronis Key Validator
          </h1>
        </div>
      </div>
    </header>
  )
}