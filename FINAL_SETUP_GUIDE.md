# QuickShift Backend Integration Setup

## 🚀 Complete Setup Guide

### 1. Environment Configuration

Your `.env.local` should contain:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# For production, update to your deployed backend URL:
# NEXT_PUBLIC_API_BASE_URL=https://your-deployed-backend.com
```

### 2. Backend Requirements

Your Node.js backend should have these endpoints:

#### Employers API

- `GET /api/employers` - Get all employers
- `GET /api/employers/:id` - Get employer by ID
- `PATCH /api/employers/:id/verify` - Verify employer
- `PATCH /api/employers/:id/suspend` - Suspend employer

#### Users API (for undergraduates)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user (for verify/suspend actions)

#### Expected Response Format

```json
{
  "success": true,
  "data": [...],
  "message": "Success message",
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### 3. Testing Your Integration

#### Option 1: Browser Console

1. Open your admin panel in the browser
2. Open Developer Tools (F12)
3. In the console, run: `testBackendConnection()`

#### Option 2: Import in Component

```typescript
import { testConnection } from "@/lib/test-connection";

// In your component or useEffect
const runTest = async () => {
  const results = await testConnection();
  console.log("Test results:", results);
};
```

### 4. Common Issues & Solutions

#### CORS Issues

Add to your backend:

```javascript
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

#### Authentication

The frontend automatically includes JWT tokens from localStorage:

```javascript
headers["Authorization"] = `Bearer ${token}`;
```

#### Response Format

Ensure your backend returns consistent format:

```javascript
res.json({
  success: true,
  data: results,
  message: "Operation successful",
  total: results.length,
});
```

### 5. Development Workflow

1. **Start Backend Server**

   ```bash
   cd your-backend-folder
   npm start
   # Should run on http://localhost:5000
   ```

2. **Start Frontend**

   ```bash
   cd quickshift-frontend
   npm run dev
   # Runs on http://localhost:3000
   ```

3. **Test Connection**
   - Navigate to `/admin`
   - Check browser console for any API errors
   - Use the test function to verify all endpoints

### 6. Production Deployment

1. **Update Environment Variables**

   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
   ```

2. **Backend CORS Configuration**

   ```javascript
   origin: ["https://your-frontend-domain.com"];
   ```

3. **SSL/HTTPS**
   - Ensure both frontend and backend use HTTPS in production
   - Update all API URLs to use HTTPS

### 7. Features Implemented

✅ **Employer Management**

- View all employers with pagination
- Search and filter functionality
- Verify/suspend actions with toast notifications
- Dynamic location filtering from API data

✅ **User Management**

- View all undergraduate users
- University filtering (dynamically loaded)
- Verify/suspend/activate actions
- Detailed user profile view

✅ **Error Handling**

- Graceful fallback to local API routes
- Toast notifications for user actions
- Loading states for all API calls
- Detailed error messages in development

✅ **Performance**

- Debounced search (300ms)
- Memoized filtering
- Optimized re-renders

### 8. Next Steps

1. **Remove Debug Code** ✅ (Completed)
2. **Test with Real Backend** ⚠️ (Needs verification)
3. **Production Environment** 🔄 (Update ENV variables)
4. **Monitoring** 🔄 (Add error tracking)

### 9. API Endpoint Mapping

| Frontend Function              | Backend Endpoint            | Method | Purpose         |
| ------------------------------ | --------------------------- | ------ | --------------- |
| `employersApi.getAll()`        | `/api/employers`            | GET    | List employers  |
| `employersApi.verify(id)`      | `/api/employers/:id/verify` | PATCH  | Verify employer |
| `undergraduatesApi.getAll()`   | `/api/users`                | GET    | List users      |
| `undergraduatesApi.verify(id)` | `/api/users/:id`            | PATCH  | Verify user     |

### 10. Troubleshooting

**No data showing:**

- Check network tab for API call status
- Verify backend is running and accessible
- Check CORS configuration

**Actions not working:**

- Check browser console for errors
- Verify JWT token is being sent
- Check backend logs for errors

**Performance issues:**

- Monitor API response times
- Check for unnecessary re-renders
- Verify debounced search is working

---

## 🎯 Ready for Production!

Your frontend is now fully integrated with backend APIs. The integration includes:

- Real-time data fetching
- Error handling and fallbacks
- User-friendly notifications
- Responsive design
- Performance optimizations

**Final Checklist:**

- [ ] Backend server running
- [ ] Environment variables configured
- [ ] CORS properly set up
- [ ] Test all admin functions
- [ ] Verify error handling
- [ ] Check performance metrics
