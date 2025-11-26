import { createRoot } from 'react-dom/client';

console.log('🚀 Main Debug Starting...');

// Check localStorage immediately
console.log('📦 LocalStorage Contents:');
console.log('  - taskflow_user:', localStorage.getItem('taskflow_user'));
console.log('  - taskflow_access_token:', localStorage.getItem('taskflow_access_token'));
console.log('  - taskflow_refresh_token:', localStorage.getItem('taskflow_refresh_token'));
console.log('  - taskflow_site_code:', localStorage.getItem('taskflow_site_code'));

// Test imports
console.log('📥 Testing imports...');

import('./services/api').then(({ authApi }) => {
  console.log('✅ authApi loaded');
  const user = authApi.getStoredUser();
  console.log('👤 getStoredUser():', user);
  console.log('🔐 isAuthenticated():', authApi.isAuthenticated());
}).catch(err => {
  console.error('❌ Failed to load authApi:', err);
});

import('./App').then((App) => {
  console.log('✅ App.tsx loaded');
  const AppComponent = App.default;

  const root = document.getElementById('root');
  if (!root) {
    console.error('❌ Root element not found!');
    return;
  }

  console.log('✅ Root element found, rendering App...');

  try {
    createRoot(root).render(<AppComponent />);
    console.log('✅ App rendered successfully!');
  } catch (err) {
    console.error('❌ Render error:', err);
    root.innerHTML = `
      <div style="background: #181c28; color: white; padding: 20px; font-family: monospace;">
        <h1 style="color: #ef4444;">❌ Render Error</h1>
        <pre style="background: #292d39; padding: 15px; border-radius: 8px; overflow: auto;">
${err}
        </pre>
        <button
          onclick="localStorage.clear(); location.reload();"
          style="
            background: #0ea5e9;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 15px;
          "
        >
          🗑️ Clear Storage & Reload
        </button>
      </div>
    `;
  }
}).catch(err => {
  console.error('❌ Failed to load App.tsx:', err);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background: #181c28; color: white; padding: 20px; font-family: monospace;">
        <h1 style="color: #ef4444;">❌ Failed to Load App</h1>
        <pre style="background: #292d39; padding: 15px; border-radius: 8px; overflow: auto;">
${err}
        </pre>
      </div>
    `;
  }
});
