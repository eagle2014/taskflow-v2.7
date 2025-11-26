import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Debug App Component
function DebugApp() {
  const [tests, setTests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const log = (name: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    console.log(`[${status.toUpperCase()}] ${name}:`, message, data || '');
    setTests(prev => [...prev, { name, status, message, data, time: new Date().toISOString() }]);
  };

  useEffect(() => {
    const runTests = async () => {
      log('Start', 'info', 'Debug app initializing...');

      // Test 1: Check localStorage
      try {
        const storedUser = localStorage.getItem('taskflow_user');
        log('LocalStorage', storedUser ? 'success' : 'info',
          storedUser ? 'User found in localStorage' : 'No user in localStorage',
          storedUser ? JSON.parse(storedUser) : null);

        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e: any) {
        log('LocalStorage', 'error', e.message);
      }

      // Test 2: Check authApi
      try {
        const { authApi } = await import('./services/api');
        const user = authApi.getStoredUser();
        log('AuthAPI.getStoredUser', user ? 'success' : 'info',
          user ? 'User found via authApi' : 'No user via authApi', user);

        if (user) {
          setCurrentUser(user);
        }
      } catch (e: any) {
        log('AuthAPI', 'error', e.message);
      }

      // Test 3: Try loading SimpleAuthReal
      try {
        const { SimpleAuthReal } = await import('./components/SimpleAuthReal');
        log('SimpleAuthReal', 'success', 'Component loaded successfully');
      } catch (e: any) {
        log('SimpleAuthReal', 'error', 'Failed to load component: ' + e.message);
      }

      // Test 4: Try loading App
      try {
        const App = await import('./App');
        log('App.tsx', 'success', 'Main App component loaded');
      } catch (e: any) {
        log('App.tsx', 'error', 'Failed to load App: ' + e.message);
      }

      // Test 5: Check API connectivity
      try {
        const response = await fetch('http://localhost:5001/health');
        const text = await response.text();
        log('Backend API', response.ok ? 'success' : 'error',
          `Health check: ${response.status}`, text);
      } catch (e: any) {
        log('Backend API', 'error', 'Cannot reach backend: ' + e.message);
      }

      setLoading(false);
      log('Complete', 'success', 'All tests completed');
    };

    runTests();
  }, []);

  const handleTestLogin = async () => {
    log('Manual Login', 'info', 'Testing login...');
    try {
      const { authApi } = await import('./services/api');
      const response = await authApi.login('admin@acme.com', 'admin123', 'ACME');
      log('Login Test', 'success', 'Login successful!', response);
      setCurrentUser(response.user);
    } catch (e: any) {
      log('Login Test', 'error', e.message);
    }
  };

  const handleClearStorage = () => {
    localStorage.clear();
    log('Clear Storage', 'success', 'LocalStorage cleared');
    setCurrentUser(null);
  };

  const handleLoadRealApp = async () => {
    log('Load Real App', 'info', 'Loading main application...');
    try {
      const App = (await import('./App')).default;
      const root = document.getElementById('root');
      if (root) {
        createRoot(root).render(<App />);
        log('Load Real App', 'success', 'Main app rendered!');
      }
    } catch (e: any) {
      log('Load Real App', 'error', e.message);
    }
  };

  return (
    <div style={{
      background: '#181c28',
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '14px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#0ea5e9', marginBottom: '20px' }}>
          🔍 TaskFlow Debug Console
        </h1>

        {/* Status Bar */}
        <div style={{
          background: '#292d39',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #3d4457'
        }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <strong>Loading:</strong> {loading ? '⏳ Running...' : '✅ Complete'}
            </div>
            <div>
              <strong>Current User:</strong> {currentUser ? `✅ ${currentUser.name}` : '❌ Not logged in'}
            </div>
            <div>
              <strong>Tests:</strong> {tests.length}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleTestLogin}
            style={{
              background: '#0ea5e9',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            🧪 Test Login
          </button>
          <button
            onClick={handleClearStorage}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            🗑️ Clear Storage
          </button>
          <button
            onClick={handleLoadRealApp}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            🚀 Load Real App
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            🔄 Reload
          </button>
        </div>

        {/* Test Results */}
        <div>
          <h2 style={{ marginBottom: '15px', color: '#a78bfa' }}>Test Results</h2>
          {tests.map((test, idx) => (
            <div
              key={idx}
              style={{
                background: '#292d39',
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '6px',
                border: `1px solid ${
                  test.status === 'success' ? '#10b981' :
                  test.status === 'error' ? '#ef4444' : '#3d4457'
                }`,
                borderLeft: `4px solid ${
                  test.status === 'success' ? '#10b981' :
                  test.status === 'error' ? '#ef4444' : '#0ea5e9'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong style={{ color: '#fff' }}>
                  {test.status === 'success' ? '✅' :
                   test.status === 'error' ? '❌' : 'ℹ️'} {test.name}
                </strong>
                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                  {new Date(test.time).toLocaleTimeString()}
                </span>
              </div>
              <div style={{ color: '#9ca3af', marginBottom: '5px' }}>
                {test.message}
              </div>
              {test.data && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ cursor: 'pointer', color: '#a78bfa' }}>
                    Show data
                  </summary>
                  <pre style={{
                    background: '#181c28',
                    padding: '10px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    marginTop: '5px',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {/* Current User Info */}
        {currentUser && (
          <div style={{
            background: '#292d39',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px',
            border: '1px solid #10b981'
          }}>
            <h3 style={{ color: '#10b981', marginBottom: '10px' }}>
              👤 Current User
            </h3>
            <pre style={{
              background: '#181c28',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Mount Debug App
const root = document.getElementById('root');
if (root) {
  console.log('🔍 Debug App Starting...');
  createRoot(root).render(<DebugApp />);
}
