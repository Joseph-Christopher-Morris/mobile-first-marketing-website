import { Layout } from '@/components/layout';

export default function Custom500() {
  return (
    <Layout pageTitle='Server Error'>
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-6xl font-bold text-gray-900 mb-4'>500</h1>
          <h2 className='text-2xl font-semibold text-gray-700 mb-4'>
            Server Error
          </h2>
          <p className='text-gray-600 mb-8'>Something went wrong on our end.</p>
          <a
            href='/'
            className='inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'
          >
            Go Home
          </a>
        </div>
      </div>
    </Layout>
  );
}
