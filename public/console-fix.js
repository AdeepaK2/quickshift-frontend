// Quick fix for expired admin token
// Copy and paste this entire script into the browser console on the admin page

console.log('🔧 QuickShift Admin Token Fix');

async function quickFixAdminAuth() {
  try {
    console.log('1. Clearing old tokens...');
    
    // Clear all existing auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    
    console.log('2. Logging in with admin credentials...');
    
    // Login with admin credentials
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testadmin@quickshift.com',
        password: 'admin123',
        userType: 'admin'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('3. Setting new tokens...');
      
      // Set new tokens
      const tokens = data.data.tokens;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Set cookies for middleware
      document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=86400`;
      document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800`;
      document.cookie = `userType=admin; path=/; max-age=2592000`;
      
      console.log('✅ Success! Admin authentication fixed.');
      console.log('🔄 Refreshing page in 2 seconds...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } else {
      console.error('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
quickFixAdminAuth();
