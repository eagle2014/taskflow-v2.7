import React, { useEffect, useState } from 'react';
import { useLogto } from '@logto/react';
import { extractSiteFromClaims, siteAssignmentStrategy } from '../config/logto.config';
import { authApi } from '../services/api';

interface Site {
  siteID: string;
  siteCode: string;
  siteName: string;
  domain?: string;
}

const LogtoAuth: React.FC = () => {
  const { isAuthenticated, signIn, signOut, isLoading, getIdTokenClaims, getAccessToken } = useLogto();
  const [error, setError] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [syncCompleted, setSyncCompleted] = useState(false); // Prevent infinite loop
  const [availableSites, setAvailableSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [showSiteSelection, setShowSiteSelection] = useState(false);

  console.log('🔐 [LogtoAuth] State:', { isAuthenticated, isLoading, syncing, syncCompleted, showSiteSelection });

  useEffect(() => {
    console.log('🔐 [LogtoAuth] useEffect triggered:', { isAuthenticated, syncing, syncCompleted });
    // Only trigger once - not when syncing or already completed
    if (isAuthenticated && !syncing && !syncCompleted) {
      console.log('🔐 [LogtoAuth] Calling handleLogtoAuthenticated...');
      handleLogtoAuthenticated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLogtoAuthenticated = async () => {
    try {
      setSyncing(true);
      setError('');

      // Get Logto access token and claims
      const apiBaseUrl = 'http://localhost:5001'; // Backend API URL
      const accessToken = await getAccessToken(apiBaseUrl);
      const claims = await getIdTokenClaims();

      if (!claims || !accessToken) {
        throw new Error('Failed to get Logto claims or token');
      }

      const logtoUserID = claims.sub;
      const email = claims.email as string;
      const name = claims.name as string || claims.username as string || email;
      const avatar = claims.picture as string | undefined;

      // Determine site assignment strategy
      let siteIdentifier: string | null = null;

      if (siteAssignmentStrategy === 'custom-claim') {
        // Try to extract site from custom claims
        siteIdentifier = extractSiteFromClaims(claims);

        if (!siteIdentifier) {
          // Fallback to site selection (pass email for auto-mapping)
          const sites = await loadAvailableSites(logtoUserID, email);

          // If only 1 site found, auto-sync without showing selection
          if (sites && sites.length === 1 && sites[0].siteCode) {
            console.log('🔐 [LogtoAuth] Auto-selecting single site:', sites[0].siteCode);
            siteIdentifier = sites[0].siteCode;
          } else {
            setShowSiteSelection(true);
            setSyncing(false);
            return;
          }
        }
      } else if (siteAssignmentStrategy === 'user-selection') {
        // Load sites and let user choose (pass email for auto-mapping)
        const sites = await loadAvailableSites(logtoUserID, email);

        // If only 1 site found, auto-sync without showing selection
        if (sites && sites.length === 1 && sites[0].siteCode) {
          console.log('🔐 [LogtoAuth] Auto-selecting single site:', sites[0].siteCode);
          siteIdentifier = sites[0].siteCode;
        } else {
          setShowSiteSelection(true);
          setSyncing(false);
          return;
        }
      } else if (siteAssignmentStrategy === 'admin-mapping') {
        // Site will be determined by backend
        siteIdentifier = 'ACME'; // Default fallback
      }

      // Sync user with backend
      await syncUserToBackend(logtoUserID, email, name, avatar || null, accessToken, siteIdentifier);

    } catch (err) {
      console.error('Logto authentication error:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate with Logto');
      setSyncing(false);
    }
  };

  const loadAvailableSites = async (logtoUserID: string, email?: string): Promise<Site[] | null> => {
    try {
      const apiBaseUrl = 'http://localhost:5001';
      const url = email
        ? `${apiBaseUrl}/api/auth/logto/sites/${logtoUserID}?email=${encodeURIComponent(email)}`
        : `${apiBaseUrl}/api/auth/logto/sites/${logtoUserID}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setAvailableSites(data.data);
          return data.data; // Return sites for auto-sync check
        }
      }

      // No sites found, use default
      const defaultSites = [
        { siteID: '', siteCode: 'ACME', siteName: 'ACME Corporation', domain: '' }
      ];
      setAvailableSites(defaultSites);
      return defaultSites;
    } catch (err) {
      console.error('Failed to load sites:', err);
      const defaultSites = [
        { siteID: '', siteCode: 'ACME', siteName: 'ACME Corporation', domain: '' }
      ];
      setAvailableSites(defaultSites);
      return defaultSites;
    }
  };

  const handleSiteSelected = async () => {
    if (!selectedSite) {
      setError('Please select a site');
      return;
    }

    try {
      setSyncing(true);
      setError('');

      const accessToken = await getAccessToken('http://localhost:5001');
      const claims = await getIdTokenClaims();

      if (!claims || !accessToken) {
        throw new Error('Failed to get Logto claims or token');
      }

      const logtoUserID = claims.sub;
      const email = claims.email as string;
      const name = claims.name as string || claims.username as string || email;
      const avatar = claims.picture as string | undefined;

      await syncUserToBackend(logtoUserID, email, name, avatar || null, accessToken, selectedSite);

    } catch (err) {
      console.error('Site selection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync user');
      setSyncing(false);
    }
  };

  const syncUserToBackend = async (
    logtoUserID: string,
    email: string,
    name: string,
    avatar: string | null,
    logtoAccessToken: string,
    siteIdentifier: string
  ) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/logto/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logtoUserID,
          siteIdentifier,
          email,
          name,
          avatar,
          role: 'Member',
          logtoAccessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync user');
      }

      const data = await response.json();

      if (data.success && data.data) {
        const { accessToken, refreshToken, user } = data.data;

        // Store TaskFlow JWT tokens (use same keys as TokenManager in api.ts)
        localStorage.setItem('taskflow_access_token', accessToken);
        localStorage.setItem('taskflow_refresh_token', refreshToken);
        localStorage.setItem('taskflow_site_code', user.siteID);
        localStorage.setItem('taskflow_user', JSON.stringify(user));

        console.log('🔐 [LogtoAuth] Sync successful, redirecting to /workspace...');

        // Mark sync as completed to prevent re-triggering
        setSyncCompleted(true);

        // Redirect to workspace
        window.location.href = '/workspace';
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      throw err;
    }
  };

  console.log('🔐 [LogtoAuth] Rendering branch check:', {
    renderLoading: isLoading || syncing || syncCompleted,
    renderSiteSelection: showSiteSelection,
    renderLoginButton: !isLoading && !syncing && !syncCompleted && !showSiteSelection
  });

  // Show loading while: loading, syncing, OR sync completed (waiting for redirect)
  if (isLoading || syncing || syncCompleted) {
    console.log('🔐 [LogtoAuth] Rendering LOADING screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center border-4 border-blue-500/20">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">T</span>
            </div>
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">
            {syncCompleted ? 'Đang chuyển hướng...' : syncing ? 'Đang đồng bộ tài khoản...' : 'Đang tải...'}
          </p>
        </div>
      </div>
    );
  }

  if (showSiteSelection) {
    console.log('🔐 [LogtoAuth] Rendering SITE SELECTION screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full border-4 border-blue-500/20">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">T</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 text-center">
            Chọn Site của bạn
          </h2>
          <p className="text-center text-gray-600 mb-6">Vui lòng chọn tổ chức để tiếp tục</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          <div className="space-y-3">
            {availableSites.map((site) => (
              <label
                key={site.siteCode}
                className={`flex items-center p-4 border-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedSite === site.siteCode
                    ? 'border-indigo-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                <input
                  type="radio"
                  name="site"
                  value={site.siteCode}
                  checked={selectedSite === site.siteCode}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="mr-4 w-5 h-5 text-indigo-600"
                />
                <div>
                  <div className="font-bold text-gray-900 text-lg">{site.siteName}</div>
                  <div className="text-sm text-indigo-600 font-medium">{site.siteCode}</div>
                  {site.domain && <div className="text-xs text-gray-500">{site.domain}</div>}
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleSiteSelected}
            disabled={!selectedSite}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            Tiếp tục
          </button>

          <button
            onClick={() => signOut(window.location.origin)}
            className="w-full mt-4 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Hủy và đăng xuất
          </button>
        </div>
      </div>
    );
  }

  console.log('🔐 [LogtoAuth] Rendering LOGIN BUTTON screen');
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '60px 40px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        maxWidth: '480px',
        width: '100%',
        border: '3px solid #6366f1'
      }}>
        {/* Logo/Icon */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
          }}>
            <span style={{ color: '#ffffff', fontSize: '60px', fontWeight: '900' }}>T</span>
          </div>
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          textAlign: 'center',
          color: '#1e40af',
          marginBottom: '16px',
          letterSpacing: '-0.5px'
        }}>
          TaskFlow
        </h1>

        <p style={{
          textAlign: 'center',
          color: '#374151',
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '40px'
        }}>
          Quản lý công việc hiện đại
        </p>

        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            color: '#991b1b',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        <button
          onClick={() => signIn(`${window.location.origin}/auth/callback`)}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            color: '#ffffff',
            padding: '20px 32px',
            borderRadius: '16px',
            fontWeight: '900',
            fontSize: '22px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(99, 102, 241, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.4)';
          }}
        >
          <svg
            style={{ width: '28px', height: '28px', marginRight: '16px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Đăng nhập với Logto
        </button>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>
            🔒 Bảo mật bởi Logto Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogtoAuth;
