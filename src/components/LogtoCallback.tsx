import React, { useEffect } from 'react';
import { useHandleSignInCallback } from '@logto/react';

/**
 * Logto OAuth callback handler component
 *
 * This component should be rendered at the callback URL (e.g., /auth/callback)
 * It handles the OAuth callback and redirects to the main app
 */
const LogtoCallback: React.FC = () => {
  const { isLoading, error } = useHandleSignInCallback(() => {
    // Callback completed successfully, redirect to home
    window.location.href = '/';
  });

  useEffect(() => {
    if (error) {
      console.error('Logto callback error:', error);
    }
  }, [error]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-6">{error.message || 'Failed to complete sign-in'}</p>
          <a
            href="/"
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Return to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-700 font-medium">
          {isLoading ? 'Completing sign-in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
};

export default LogtoCallback;
