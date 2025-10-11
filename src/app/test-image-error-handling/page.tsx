'use client';

import React from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function TestImageErrorHandling() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Error Handling Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Test 1: Working Image */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Working Image</h2>
          <div className="border rounded-lg p-4">
            <OptimizedImage
              src="/images/hero/paid-ads-analytics-screenshot.webp"
              alt="Working analytics screenshot"
              width={300}
              height={200}
              className="rounded"
            />
          </div>
        </div>

        {/* Test 2: Broken Image Path */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Broken Image (No Fallback)</h2>
          <div className="border rounded-lg p-4">
            <OptimizedImage
              src="/images/non-existent-image.jpg"
              alt="This image does not exist"
              width={300}
              height={200}
              className="rounded"
              maxRetries={2}
              retryDelay={1000}
            />
          </div>
        </div>

        {/* Test 3: Broken Image with Fallback */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Broken Image with Fallback</h2>
          <div className="border rounded-lg p-4">
            <OptimizedImage
              src="/images/broken-image.jpg"
              alt="Broken image with fallback"
              width={300}
              height={200}
              className="rounded"
              fallbackSrc="/images/hero/paid-ads-analytics-screenshot.webp"
            />
          </div>
        </div>

        {/* Test 4: Custom Error Message */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Custom Error Message</h2>
          <div className="border rounded-lg p-4">
            <OptimizedImage
              src="/images/another-broken-image.jpg"
              alt="Custom error message test"
              width={300}
              height={200}
              className="rounded"
              errorMessage="Oops! This image couldn't be loaded."
              maxRetries={1}
            />
          </div>
        </div>

        {/* Test 5: Custom Loading Component */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Custom Loading Component</h2>
          <div className="border rounded-lg p-4">
            <OptimizedImage
              src="/images/hero/paid-ads-analytics-screenshot.webp"
              alt="Custom loading test"
              width={300}
              height={200}
              className="rounded"
              loadingComponent={
                <div className="w-full h-48 bg-blue-100 flex items-center justify-center">
                  <div className="text-blue-600">🔄 Custom Loading...</div>
                </div>
              }
            />
          </div>
        </div>

        {/* Test 6: Custom Error Component */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Custom Error Component</h2>
          <div className="border rounded-lg p-4">
            <OptimizedImage
              src="/images/custom-error-test.jpg"
              alt="Custom error component test"
              width={300}
              height={200}
              className="rounded"
              errorComponent={
                <div className="w-full h-48 bg-purple-100 border-2 border-purple-300 flex items-center justify-center">
                  <div className="text-purple-600 text-center">
                    <div className="text-2xl mb-2">🎨</div>
                    <div>Custom Error Design</div>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* Test 7: No Loading Indicator */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">7. No Loading Indicator</h2>
          <div className="border rounded-lg p-4">
            <OptimizedImage
              src="/images/hero/paid-ads-analytics-screenshot.webp"
              alt="No loading indicator test"
              width={300}
              height={200}
              className="rounded"
              showLoadingIndicator={false}
            />
          </div>
        </div>

        {/* Test 8: No Error Message */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">8. No Error Message</h2>
          <div className="border rounded-lg p-4">
            <OptimizedImage
              src="/images/silent-error-test.jpg"
              alt="Silent error test"
              width={300}
              height={200}
              className="rounded"
              showErrorMessage={false}
            />
          </div>
        </div>

        {/* Test 9: Fill Mode Error */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">9. Fill Mode with Error</h2>
          <div className="border rounded-lg p-4">
            <div className="relative w-full h-48">
              <OptimizedImage
                src="/images/fill-mode-error.jpg"
                alt="Fill mode error test"
                fill
                className="rounded"
                objectFit="cover"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="mt-12 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
        <ul className="space-y-2 text-sm">
          <li><strong>Test 1:</strong> Should load successfully and show the analytics screenshot</li>
          <li><strong>Test 2:</strong> Should show loading, then retry indicators, then error message</li>
          <li><strong>Test 3:</strong> Should fail initially, then load the fallback image</li>
          <li><strong>Test 4:</strong> Should show custom error message</li>
          <li><strong>Test 5:</strong> Should show custom loading component briefly</li>
          <li><strong>Test 6:</strong> Should show custom error component</li>
          <li><strong>Test 7:</strong> Should load without showing loading indicator</li>
          <li><strong>Test 8:</strong> Should show error state but without text message</li>
          <li><strong>Test 9:</strong> Should show error in fill mode</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          Open browser developer tools to see detailed logging of the image loading process.
        </p>
      </div>
    </div>
  );
}