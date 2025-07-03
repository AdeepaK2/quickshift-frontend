// Browser console script to check and refresh admin authentication
console.log('=== Admin Authentication Debug ===');

// Check current tokens
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
const userType = localStorage.getItem('userType');

console.log('Current tokens:');
console.log('Access Token:', accessToken ? 'Present (' + accessToken.length + ' chars)' : 'Missing');
console.log('Refresh Token:', refreshToken ? 'Present (' + refreshToken.length + ' chars)' : 'Missing');
console.log('User Type:', userType);

// Test current token validity
async function testTokenValidity() {
  if (!accessToken) {
    console.log('❌ No access token found - user needs to log in');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.log('❌ Token is expired - user needs to log in again');
      console.log('Clearing expired tokens...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userString');
      window.location.href = '/auth/login';
    } else if (response.ok) {
      console.log('✅ Token is valid');
      const data = await response.json();
      console.log('Dashboard data:', data);
    } else {
      console.log('❌ Unexpected response:', response.status);
    }
  } catch (error) {
    console.error('Error testing token:', error);
  }
}

// Function to refresh the page and clear cache
function refreshAndClearCache() {
  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  // Hard refresh
  window.location.reload();
}

// Run the test
testTokenValidity();

// Provide helper functions
window.debugAuth = {
  testToken: testTokenValidity,
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userString');
    console.log('✅ All tokens cleared');
  },
  refreshPage: refreshAndClearCache,
  goToLogin: () => {
    window.location.href = '/auth/login';
  }
};

console.log('Available functions:');
console.log('- window.debugAuth.testToken() - Test current token');
console.log('- window.debugAuth.clearTokens() - Clear all tokens');
console.log('- window.debugAuth.refreshPage() - Refresh and clear cache');
console.log('- window.debugAuth.goToLogin() - Go to login page');
