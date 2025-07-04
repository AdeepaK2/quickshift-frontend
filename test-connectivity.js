// Test frontend-backend connectivity
const testFrontendBackend = async () => {
  const API_BASE_URL = 'http://localhost:5000';
  
  console.log('Testing frontend-backend connectivity...');
  
  try {
    // Test 1: Basic health check
    console.log('\n=== Test 1: Health Check ===');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test 2: Admin login
    console.log('\n=== Test 2: Admin Login ===');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testadmin@quickshift.com',
        password: 'TestAdmin123!',
        userType: 'admin'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success) {
      const token = loginData.data.tokens.accessToken;
      
      // Test 3: Get users
      console.log('\n=== Test 3: Get Users ===');
      const usersResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const usersData = await usersResponse.json();
      console.log('Users response:', {
        success: usersData.success,
        total: usersData.total,
        count: usersData.count,
        dataLength: usersData.data ? usersData.data.length : 0
      });
      
      // Test 4: Get employers
      console.log('\n=== Test 4: Get Employers ===');
      const employersResponse = await fetch(`${API_BASE_URL}/api/admin/employers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const employersData = await employersResponse.json();
      console.log('Employers response:', {
        success: employersData.success,
        total: employersData.total,
        count: employersData.count,
        dataLength: employersData.data ? employersData.data.length : 0
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testFrontendBackend();
