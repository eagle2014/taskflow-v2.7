import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckSquare, Eye, EyeOff, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { debugApiConnectivity } from '../utils/api';

interface AuthProps {
  onAuthSuccess: (session: any) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  const testConnection = async () => {
    setIsTestingConnection(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('🔧 Testing API connectivity...');
      const result = await debugApiConnectivity();
      
      if (result.success) {
        setConnectionStatus('connected');
        setError('');
        console.log('✅ Connection test successful!');
      } else {
        setConnectionStatus('disconnected');
        setError(`Connection failed: ${result.error}`);
        console.error('❌ Connection test failed:', result.error);
      }
    } catch (err: any) {
      setConnectionStatus('disconnected');
      setError(`Connection test failed: ${err.message}`);
      console.error('❌ Connection test error:', err);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🔐 Attempting to sign in with email:', email);
      
      // Test basic connectivity first
      try {
        const { data: { session: testSession }, error: testError } = await supabase.auth.getSession();
        console.log('✅ Supabase client connectivity test passed');
      } catch (connectError) {
        console.error('❌ Supabase connectivity issue:', connectError);
        throw new Error('Unable to connect to authentication service. Please check your internet connection.');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('🔐 Sign in error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      if (!data.session) {
        throw new Error('No session returned from sign in');
      }
      
      console.log('✅ Sign in successful, routing to main app...');
      onAuthSuccess(data.session);
    } catch (err: any) {
      console.error('❌ Sign in error:', err);
      let errorMessage = 'Failed to sign in';
      
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = `📧 Please check your email (${email}) and click the confirmation link to activate your account.\n\nAfter confirming your email, return here and sign in with your credentials.`;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!name.trim()) {
        throw new Error('Name is required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('Attempting to sign up with email:', email);
      
      // Use direct Supabase signup
      console.log('Creating user via Supabase Auth...');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from signup');
      }

      // Check if email confirmation is required
      if (!data.session && data.user && !data.user.email_confirmed_at) {
        console.log('Email confirmation required');
        setSuccessMessage(`Account created successfully! 

Please check your email (${email}) and click the confirmation link to activate your account.

After confirming your email, return here and sign in with your credentials.`);
        setIsSignUp(false); // Switch to sign in mode
        setLoading(false);
        return;
      }

      // If we have a session, user is automatically signed in
      if (data.session) {
        console.log('Signup successful with immediate session, routing to main app...');
        onAuthSuccess(data.session);
        return;
      }

      // Fallback: try to sign in if no session but user exists
      console.log('Attempting to sign in after signup...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setSuccessMessage(`Account created successfully! 

Please check your email (${email}) and click the confirmation link to activate your account.

After confirming your email, return here and sign in with your credentials.`);
          setIsSignUp(false); // Switch to sign in mode
          return;
        }
        console.error('Sign in after signup error:', signInError);
        throw signInError;
      }

      if (!signInData.session) {
        throw new Error('No session returned after signup');
      }
      
      console.log('Signup and sign in successful, routing to main app...');
      onAuthSuccess(signInData.session);
    } catch (err: any) {
      console.error('Sign up error:', err);
      let errorMessage = 'Failed to create account';
      
      if (err.message?.includes('Failed to fetch') || err.name === 'AuthRetryableFetchError') {
        errorMessage = '🌐 Network connection error. Please check your internet connection and try again.\n\n💡 If the problem persists, the Supabase project may need configuration.';
      } else if (err.name === 'AuthApiError' && err.message?.includes('Database error')) {
        errorMessage = '🗄️ Database connection error. The authentication service may need setup.\n\n💡 Please run the database setup script or contact support.';
      } else if (err.message?.includes('already registered') || err.message?.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
        setIsSignUp(false);
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.message?.includes('weak password')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.message?.includes('Email not confirmed')) {
        setSuccessMessage(`Please check your email (${email}) and click the confirmation link to activate your account.

After confirming your email, return here and sign in with your credentials.`);
        setIsSignUp(false); // Switch to sign in mode
        return;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181c28] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#292d39] border-[#3d4457] p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0394ff] to-[#0570cd] rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold text-white">TaskFlow</span>
          </div>
          <p className="text-[#838a9c]">
            Modern Task Management System
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="text-[#838a9c] text-sm">
            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#3d4457] border border-[#4a5568] rounded-lg px-4 py-3 text-white placeholder-[#838a9c] focus:outline-none focus:ring-2 focus:ring-[#0394ff] focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#3d4457] border border-[#4a5568] rounded-lg px-4 py-3 text-white placeholder-[#838a9c] focus:outline-none focus:ring-2 focus:ring-[#0394ff] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#3d4457] border border-[#4a5568] rounded-lg px-4 py-3 pr-12 text-white placeholder-[#838a9c] focus:outline-none focus:ring-2 focus:ring-[#0394ff] focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#838a9c] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {isSignUp && (
              <p className="text-xs text-[#838a9c] mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {successMessage && (
            <div className="flex items-start gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20">
              <CheckSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="whitespace-pre-line">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="whitespace-pre-line">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0394ff] hover:bg-[#0570cd] text-white py-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMessage('');
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="text-[#0394ff] hover:text-[#0570cd] text-sm"
            disabled={loading}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>

        {/* Debug Connection Test */}
        <div className="mt-6 pt-4 border-t border-[#3d4457]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#838a9c]">Server Status:</span>
              {connectionStatus === 'connected' && (
                <div className="flex items-center gap-1 text-green-400">
                  <Wifi className="w-3 h-3" />
                  <span className="text-xs">Connected</span>
                </div>
              )}
              {connectionStatus === 'disconnected' && (
                <div className="flex items-center gap-1 text-red-400">
                  <WifiOff className="w-3 h-3" />
                  <span className="text-xs">Disconnected</span>
                </div>
              )}
              {connectionStatus === 'unknown' && (
                <span className="text-xs text-[#838a9c]">Unknown</span>
              )}
            </div>
            <Button
              type="button"
              onClick={testConnection}
              disabled={isTestingConnection || loading}
              variant="outline"
              size="sm"
              className="text-xs bg-[#3d4457] border-[#4a5568] text-white hover:bg-[#4a5568]"
            >
              {isTestingConnection ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>
          
          {connectionStatus === 'disconnected' && (
            <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-400 mb-2">
                ⚠️ Database setup required
              </p>
              <details className="text-xs text-[#838a9c]">
                <summary className="cursor-pointer hover:text-white mb-2">
                  Quick Fix Instructions
                </summary>
                <div className="space-y-2 pl-2 border-l border-yellow-500/20">
                  <p className="text-blue-400">1. Go to your Supabase Dashboard</p>
                  <p className="text-blue-400">2. Open SQL Editor</p>
                  <p className="text-blue-400">3. Run the setup script from DATABASE_SETUP.md</p>
                  <p className="text-green-400 mt-2">→ This creates required database tables</p>
                  <p className="text-[#838a9c] mt-2">Auth works immediately, but Projects/Tasks need database setup</p>
                </div>
              </details>
            </div>
          )}
          
          <p className="text-xs text-[#838a9c] text-center">
            {connectionStatus === 'connected' 
              ? "✅ Database is ready! Full features available."
              : connectionStatus === 'disconnected'
              ? "⚠️ Limited mode: Auth works, database features need setup."
              : "Testing database connectivity..."
            }
          </p>
        </div>
      </Card>
    </div>
  );
}