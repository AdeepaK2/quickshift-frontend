// Debug script to test admin data fetching in browser environment
const API_BASE_URL = 'http://localhost:5000';

async function debugAdminData() {
  try {
    // Get token from localStorage (simulating browser environment)
    const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NGFmNWUzY2ZjYzcyYzY3YTU5MDFiMCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTUyNzQxNSwiZXhwIjoxNzUxNjEzODE1fQ.Lyv5c6MgnBBIKVQmZOh5cYZhVAy6sEA92wCrzbD1mquY';
    
    console.log('=== Testing Admin Data Fetching ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Access Token:', accessToken ? 'Present' : 'Missing');
    
    // Test 1: Get Users
    console.log('\n=== Test 1: Get Users ===');
    const usersUrl = `${API_BASE_URL}/api/admin/users`;
    console.log('Users URL:', usersUrl);
    
    const usersResponse = await fetch(usersUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache',
      },
    });
    
    const usersData = await usersResponse.json();
    console.log('Users Response Status:', usersResponse.status);
    console.log('Users Response:', {
      success: usersData.success,
      total: usersData.total,
      count: usersData.count,
      dataLength: usersData.data?.length,
      firstUser: usersData.data?.[0]?.firstName + ' ' + usersData.data?.[0]?.lastName
    });
    
    // Test 2: Get Employers  
    console.log('\n=== Test 2: Get Employers ===');
    const employersUrl = `${API_BASE_URL}/api/admin/employers`;
    console.log('Employers URL:', employersUrl);
    
    const employersResponse = await fetch(employersUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache',
      },
    });
    
    const employersData = await employersResponse.json();
    console.log('Employers Response Status:', employersResponse.status);
    console.log('Employers Response:', {
      success: employersData.success,
      total: employersData.total,
      count: employersData.count,
      dataLength: employersData.data?.length,
      firstEmployer: employersData.data?.[0]?.companyName
    });
    
    // Test 3: Dashboard Stats
    console.log('\n=== Test 3: Dashboard Stats ===');
    const dashboardUrl = `${API_BASE_URL}/api/admin/dashboard`;
    console.log('Dashboard URL:', dashboardUrl);
    
    const dashboardResponse = await fetch(dashboardUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache',
      },
    });
    
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard Response Status:', dashboardResponse.status);
    console.log('Dashboard Response:', {
      success: dashboardData.success,
      totalUsers: dashboardData.data?.overview?.totalUsers,
      totalEmployers: dashboardData.data?.overview?.totalEmployers,
      activeGigs: dashboardData.data?.overview?.activeGigs
    });
    
    console.log('\n=== Debug Complete ===');
    
  } catch (error) {
    console.error('Debug Error:', error);
  }
}

if (typeof window !== 'undefined') {
  // Browser environment
  debugAdminData();
} else {
  // Node.js environment (Node 18+ has built-in fetch)
  debugAdminData();
}
