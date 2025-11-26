// Connectivity Test API - Mock version (no real Supabase)
// All data is stored in localStorage

export const testConnectivity = async () => {
  try {
    console.log('🔧 Testing API connectivity (localStorage mode)...');
    
    // Check if localStorage is available
    const storageTest = localStorage.getItem('taskflow_current_user');
    
    return {
      success: true,
      details: {
        auth: 'localStorage',
        database: 'localStorage', 
        categories: 'Static data',
        storage: storageTest !== null ? 'Active' : 'Empty'
      }
    };
  } catch (error) {
    console.error('❌ Connectivity test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
