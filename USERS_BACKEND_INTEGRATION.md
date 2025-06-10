# Backend Integration Setup for Undergraduates

## Overview

This guide explains how to connect the UndergraduatesContent component to your existing Node.js backend that has routes under `/api/users`.

## Environment Configuration

1. **Update your `.env.local` file:**

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

2. **For production, update to your deployed backend URL:**
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-deployed-backend.com
   ```

## Backend API Expectations

Your backend should expose these endpoints:

- **GET** `/api/users` - Get all undergraduate users
- **PATCH** `/api/users/:id` - Update user (verify/suspend)

### Expected API Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "profilePicture": "string",
      "fullName": "string",
      "email": "string",
      "university": "string",
      "yearOfStudy": 1,
      "studentIdVerified": true,
      "phoneNumber": "string",
      "faculty": "string",
      "gender": "Male" | "Female" | "Other",
      "dateOfBirth": "2000-01-01",
      "address": "string",
      "city": "string",
      "postalCode": "string",
      "accountStatus": "active" | "inactive" | "suspended",
      "verificationStatus": "verified" | "pending" | "rejected",
      "lastLogin": "2024-01-01T00:00:00Z",
      "bio": "string",
      "gpa": 3.5,
      "skillsAndInterests": ["skill1", "skill2"],
      "documentsUploaded": ["doc1", "doc2"],
      "joinDate": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### PATCH Request Bodies

**Verify User:**

```json
{ "verified": true }
```

**Suspend User:**

```json
{ "verified": false }
```

## Frontend Features

The updated component includes:

✅ **Real API Integration** - Connects to your backend `/api/users` endpoint
✅ **Loading States** - Shows loading spinner while fetching data
✅ **Error Handling** - Displays detailed error messages
✅ **Toast Notifications** - Success/error feedback for user actions
✅ **Dynamic Filtering** - Universities are now fetched from API data
✅ **Search & Filters** - All existing filtering functionality preserved
✅ **User Actions** - Verify, suspend, and activate users
✅ **Detail Modal** - View comprehensive user information

## Testing the Integration

1. **Start your backend server** on port 5000 (or update the env variable)

2. **Use the API Test Component** - A test component has been added to help debug the connection

3. **Check browser console** for detailed error messages and API calls

4. **Verify CORS settings** on your backend if you encounter CORS errors

## Common Issues & Solutions

### CORS Errors

Add CORS middleware to your backend:

```javascript
app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    credentials: true,
  })
);
```

### 404 Errors

- Ensure your backend routes are exactly `/api/users`
- Check that your backend server is running
- Verify the `NEXT_PUBLIC_API_BASE_URL` environment variable

### Data Format Issues

- Ensure your backend returns data in the expected format
- Check the browser network tab to see actual API responses
- Use the API test component to debug response structure

## Removing Test Components

Once the backend is connected and working:

1. Remove the `UsersApiTest` component import and usage from `UndergraduatesContent.tsx`
2. Remove the `/src/components/admin/UsersApiTest.tsx` file

## Production Deployment

1. Update `.env.local` with your production backend URL
2. Ensure your backend handles HTTPS requests
3. Verify CORS settings for your production domain
4. Test all functionality in the production environment
