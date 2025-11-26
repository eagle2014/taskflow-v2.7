import { createRoot } from 'react-dom/client';

console.log('🔍 Test render starting...');

// Test 1: Simple render
const TestComponent = () => {
  console.log('✅ TestComponent rendering');
  return (
    <div style={{
      background: '#181c28',
      color: 'white',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <h1>✅ React Render Test Success!</h1>
      <p>If you see this, React is working.</p>
    </div>
  );
};

const root = document.getElementById('root');
console.log('🔍 Root element:', root);

if (root) {
  console.log('✅ Creating React root...');
  try {
    createRoot(root).render(<TestComponent />);
    console.log('✅ Render successful!');
  } catch (error) {
    console.error('❌ Render error:', error);
    root.innerHTML = `<div style="color: red; padding: 20px;">
      <h1>Render Error</h1>
      <pre>${error}</pre>
    </div>`;
  }
} else {
  console.error('❌ Root element not found!');
}
