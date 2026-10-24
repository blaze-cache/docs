import Logo from '../assets/blaze-cache-logo.png'

export default function LandingPage() {
  return (
    <section className='min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-12'>
          <img
            src={Logo}
            alt="Blaze Cache"
            className='w-24 h-24 mx-auto mb-6'
          />
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Blaze Cache
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Client-side caching for the browser, compiled to WebAssembly with
            first-class TypeScript bindings.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          <div className='group p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow'>
            <div className='w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4'>
              <svg className='w-6 h-6 text-blue-600' viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.21L7 14.14 2 9.27l6.91-1.02L12 2z"/>
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              Synchronous API
            </h3>
            <p className='text-sm text-gray-500'>
              get/set operations run synchronously after Wasm initialization — no Promises on the hot path.
            </p>
          </div>

          <div className='group p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow'>
            <div className='w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4'>
              <svg className='w-6 h-6 text-green-600' viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.21L7 14.14 2 9.27l6.91-1.02L12 2z"/>
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              SIEVE Eviction
            </h3>
            <p className='text-sm text-gray-500'>
              O(1)-amortised eviction algorithm with tiny memory footprint — no JS object churn.
            </p>
          </div>

          <div className='group p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow'>
            <div className='w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4'>
              <svg className='w-6 h-6 text-purple-600' viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15.59L7 10l5.66 4.47 5.03-8.86L2 14.59z"/>
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              IndexedDB Persistence
            </h3>
            <p className='text-sm text-gray-500'>
              Optional durable storage with write-through persistence and debounced flushes.
            </p>
          </div>
        </div>

        <div className='mt-12 pt-8 border-t border-gray-200'>
          <a href="/about" className='inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors'>
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}