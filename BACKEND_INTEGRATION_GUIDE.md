# Frontend-Backend Integration Setup

## Overview

The frontend EmployerContent component is now configured to connect to your Node.js backend API.

## Configuration

### 1. Environment Variables

The frontend reads the backend API URL from `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

For production, update this to your deployed backend URL:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-deployed-backend.com/api
```

### 2. API Endpoints

The frontend expects these backend endpoints:

- `GET /api/employers` - Get all employers
- `GET /api/employers/:id` - Get specific employer
- `PATCH /api/employers/:id/verify` - Verify an employer
- `PATCH /api/employers/:id/suspend` - Suspend an employer

### 3. Expected API Response Format

```json
{
  "success": true,
  "data": [
    {
      "_id": "employer_id",
      "companyName": "Company Name",
      "email": "company@email.com",
      "phone": "+1234567890",
      "location": "City, Country",
      "verified": true,
      "isVerified": true,
      "ratings": {
        "averageRating": 4.5,
        "totalReviews": 10
      },
      "profilePicture": "url_to_image",
      "companyDescription": "Company description",
      "lastLoginAt": "2025-06-08T10:00:00Z",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-06-08T10:00:00Z"
    }
  ],
  "message": "Success message",
  "count": 1,
  "total": 1
}
```

## Features Implemented

### ✅ API Integration

- Real backend API calls using fetch
- Configurable base URL via environment variables
- Automatic fallback to local API if backend is unavailable
- JWT token authentication support

### ✅ Error Handling

- Connection error detection
- User-friendly error messages
- Retry functionality
- Development debugging logs

### ✅ Loading States

- Loading spinners during API calls
- Disabled buttons during mutations
- Loading state for initial data fetch

### ✅ User Feedback

- Toast notifications for success/error actions
- Clear loading indicators
- Detailed error messages

### ✅ Data Management

- Real-time data updates after actions
- Automatic data refresh after verify/suspend
- Client-side filtering (search, location, verification, rating)

## Backend Requirements

### CORS Configuration

Make sure your backend allows requests from your frontend domain:

```javascript
// Example Express.js CORS setup
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
    credentials: true,
  })
);
```

### Authentication

The frontend sends JWT tokens in the Authorization header:

```
Authorization: Bearer <token>
```

Ensure your backend validates these tokens for protected routes.

## Testing

### Development Testing

1. Start your backend server on `http://localhost:5000`
2. Start the frontend with `npm run dev`
3. Visit the admin panel and check the "API Connection Test" component
4. Verify the connection and test CRUD operations

### Production Testing

1. Update `NEXT_PUBLIC_API_BASE_URL` in production environment
2. Ensure CORS is configured for your production domain
3. Test all functionality with real data

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Check backend CORS configuration
   - Ensure frontend domain is allowed

2. **Connection Failed**

   - Verify backend server is running
   - Check the API base URL in `.env.local`
   - Ensure network connectivity

3. **Authentication Errors**

   - Check JWT token validity
   - Verify token is stored in localStorage
   - Ensure backend validates tokens correctly

4. **Data Format Issues**
   - Verify backend response matches expected format
   - Check field names match the Employer type definition
   - Ensure success/error response structure is correct

### Debug Mode

The component includes development debugging:

- API responses are logged to console
- Connection test component for quick verification
- Detailed error messages with backend URL

Remove the `ApiTestComponent` for production by setting `NODE_ENV=production`.
