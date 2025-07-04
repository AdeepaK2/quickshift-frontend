// Debug frontend admin service
import { adminService } from '../services/adminService';

const debugAdminService = async () => {
  console.log('=== Debug Admin Service ===');
  
  try {
    // First check if we have tokens
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userType = localStorage.getItem('userType');
    
    console.log('Stored tokens:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      userType,
      tokenStart: accessToken?.substring(0, 20) + '...'
    });
    
    if (!accessToken) {
      console.log('❌ No access token found. Please log in first.');
      return;
    }
    
    // Test dashboard stats
    console.log('\n=== Test Dashboard Stats ===');
    try {
      const dashboardResponse = await adminService.getDashboardStats();
      console.log('Dashboard response:', dashboardResponse);
    } catch (error) {
      console.error('Dashboard error:', error);
    }
    
    // Test get users
    console.log('\n=== Test Get Users ===');
    try {
      const usersResponse = await adminService.getAllUsers({ role: 'job_seeker' });
      console.log('Users response:', {
        success: usersResponse.success,
        total: usersResponse.data?.total,
        count: usersResponse.data?.count,
        dataLength: usersResponse.data?.data?.length
      });
    } catch (error) {
      console.error('Users error:', error);
    }
    
    // Test get employers
    console.log('\n=== Test Get Employers ===');
    try {
      const employersResponse = await adminService.getAllEmployers();
      console.log('Employers response:', {
        success: employersResponse.success,
        total: employersResponse.data?.total,
        count: employersResponse.data?.count,
        dataLength: employersResponse.data?.data?.length
      });
    } catch (error) {
      console.error('Employers error:', error);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
};

// Export for use in browser console
window.debugAdminService = debugAdminService;
console.log('Debug function available as window.debugAdminService()');
