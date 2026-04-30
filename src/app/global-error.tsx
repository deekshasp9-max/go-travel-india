'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
            <p className="text-gray-500 mt-2 text-sm">
              An unexpected error occurred. Please try again.
            </p>
          </div>
          {error.message && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
              <p className="text-xs font-mono text-red-700 break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-[10px] text-gray-400 mt-2 font-mono">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
