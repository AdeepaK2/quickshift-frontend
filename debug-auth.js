// Quick debug script to test authentication
const API_BASE_URL = 'http://localhost:5000';

async function testUserLogin() {
  try {
    console.log('🔍 Testing user login...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com', // Replace with actual test user email
        password: 'password123', // Replace with actual test password
        userType: 'user'
      }),
    });

    const data = await response.json();
    console.log('📤 Login Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login successful');
      console.log('👤 User Type:', data.data.userType);
      console.log('🔑 Has Access Token:', !!data.data.tokens?.accessToken);
      console.log('🔄 Has Refresh Token:', !!data.data.tokens?.refreshToken);
      
      // Test accessing the user endpoint
      console.log('\n🔍 Testing /me endpoint...');
      const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.data.tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const meData = await meResponse.json();
      console.log('📤 /me Response:', JSON.stringify(meData, null, 2));
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('🚨 Error:', error.message);
  }
}

testUserLogin();
