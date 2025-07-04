// Test employer application endpoints
const API_BASE_URL = 'http://localhost:5000';

// Get token from localStorage (run this in browser console)
const token = localStorage.getItem('accessToken');

if (!token) {
  console.log('No token found in localStorage');
} else {
  console.log('Token found:', token.substring(0, 20) + '...');
  
  // Test employer applications endpoint
  fetch(`${API_BASE_URL}/api/gig-applications/employer`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
