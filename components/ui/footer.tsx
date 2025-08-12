import Image from 'next/image';

export default function Footer() {
  return (
    <footer className='relative z-10 pb-12'>
      <div className='text-center'>
        <div className='flex items-center justify-center'>
          <Image
            src='/images/acronisLogo.png'
            alt='Acronis Logo'
            width={150}
            height={64}
            className='h-16 w-auto '
            priority
          />
        </div>
        <div className='text-white/60 text-lg tracking-wide'>
          Distributed by <a href='https://www.activelk.com' target='_blank' rel='noopener noreferrer'> <u> Active Solutions</u></a> in Sri Lanka
        </div>
      </div>
    </footer>
  )
}