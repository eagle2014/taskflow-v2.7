import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LogtoProvider } from '@logto/react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Projects } from './components/Projects';
import { ProjectWorkspace } from './components/ProjectWorkspaceV1';
import { Calendar } from './components/Calendar';
import { Reports } from './components/Reports';
import { MyTasks } from './components/MyTasks';
import { Team } from './components/Team';
import { Settings } from './components/Settings';
import LogtoAuth from './components/LogtoAuth';
import LogtoCallback from './components/LogtoCallback';
import ErrorBoundary from './components/ErrorBoundary';
import { I18nProvider } from './utils/i18n/context';
import { Toaster } from './components/ui/sonner';
import { authApi, User } from './services/api';
import { logtoConfig } from './config/logto.config';

// Log Logto configuration for debugging
console.log('🔧 [App.tsx] Logto Config:', {
  endpoint: logtoConfig.endpoint,
  appId: logtoConfig.appId,
  scopes: logtoConfig.scopes?.join(', '),
  resources: logtoConfig.resources
});

// Main workspace component
function Workspace() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');

    // Check for existing user session
    try {
      const user = authApi.getStoredUser();
      setCurrentUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Error getting stored user:', error);
      setLoading(false);
    }
  }, []);

  const handleSignOut = () => {
    authApi.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#181c28] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0394ff] to-[#0570cd] rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          </div>
          <div className="text-white text-lg">Loading TaskFlow...</div>
          <div className="text-[#838a9c] text-sm">Initializing workspace...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} currentUser={currentUser} />;
      case 'projects':
        return <Projects onNavigate={setCurrentView} onSelectProject={() => {}} currentUser={currentUser} />;
      case 'project-workspace':
        return null; // Handled separately for fullscreen mode
      case 'my-tasks':
        return <MyTasks currentUser={currentUser} />;
      case 'calendar':
        return null; // Calendar is handled separately below
      case 'reports':
        return <Reports />;
      case 'team':
        return <Team />;
      case 'settings':
        return <Settings currentUser={currentUser} />;
      default:
        return <Dashboard onNavigate={setCurrentView} currentUser={currentUser} />;
    }
  };

  // Fullscreen mode for Project Workspace
  if (currentView === 'project-workspace') {
    return (
      <div className="h-screen w-screen bg-[#181c28] text-white overflow-hidden">
        <ProjectWorkspace
          currentUser={currentUser}
          onBack={() => setCurrentView('dashboard')}
        />
        <Toaster
          theme="dark"
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#292d39',
              border: '1px solid #3d4457',
              color: '#ffffff',
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#181c28] text-white overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onSignOut={handleSignOut}
          user={currentUser}
        />
        <main className="flex-1 overflow-auto taskflow-scrollbar">
          {currentView === 'calendar' ? (
            <div className="animate-fade-in">
              <Calendar currentUser={currentUser} />
            </div>
          ) : (
            <div className="p-6 animate-slide-in">
              {renderView()}
            </div>
          )}
        </main>
      </div>
      <Toaster
        theme="dark"
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#292d39',
            border: '1px solid #3d4457',
            color: '#ffffff',
          },
        }}
      />
    </div>
  );
}

// Main App component with Logto Provider
export default function App() {
  return (
    <ErrorBoundary>
      <LogtoProvider config={logtoConfig}>
        <I18nProvider>
          <BrowserRouter>
            <Routes>
              {/* Logto authentication routes */}
              <Route path="/" element={<LogtoAuth />} />
              <Route path="/auth/callback" element={<LogtoCallback />} />

              {/* Main workspace route */}
              <Route path="/workspace" element={<Workspace />} />

              {/* Redirect any unknown routes to login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </I18nProvider>
      </LogtoProvider>
    </ErrorBoundary>
  );
}
