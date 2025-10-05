import Button from '@/components/ui/Button';

export default function ServiceNotFound() {
  return (
    <div className='min-h-screen bg-white flex items-center justify-center'>
      <div className='max-w-md mx-auto text-center px-4'>
        <div className='mb-8'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <svg
              className='w-12 h-12 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
              />
            </svg>
          </div>

          <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
            Service Not Found
          </h1>

          <p className='text-gray-600 mb-8'>
            Sorry, we couldn&apos;t find the service you&apos;re looking for. It
            may have been moved or doesn&apos;t exist.
          </p>
        </div>

        <div className='space-y-4'>
          <Button
            href='/services'
            variant='primary'
            size='lg'
            className='w-full'
          >
            View All Services
          </Button>

          <Button href='/' variant='outline' size='lg' className='w-full'>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
