# Vercel Deployment Fix Instructions

## Issues Fixed:
1. CORS configuration updated to allow Vercel domains
2. Environment variables properly configured
3. Better error handling for network issues
4. Proxy configuration added to handle API calls

## Steps to Deploy:

### 1. Update Backend CORS Configuration
The backend at `https://quickshift-9qjun.ondigitalocean.app` needs to be updated with the new CORS configuration that includes Vercel domains.

### 2. Set Environment Variables in Vercel
In your Vercel dashboard, add these environment variables:
- `NEXT_PUBLIC_API_BASE_URL=https://quickshift-9qjun.ondigitalocean.app`
- `NEXT_PUBLIC_VERCEL_DEPLOYMENT=true`

### 3. Update Backend Environment Variables
On DigitalOcean, update the `FRONTEND_URL` environment variable to point to your Vercel deployment URL:
- `FRONTEND_URL=https://your-vercel-app.vercel.app`

### 4. Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### 5. Test the Deployment
After deployment, test the login functionality to ensure CORS issues are resolved.

## Alternative Solution: Use Vercel as Proxy
If CORS issues persist, the `vercel.json` configuration now includes a proxy setup that routes API calls through Vercel, avoiding CORS issues entirely.

## Environment Variables for Different Stages:
- **Development**: Uses `.env.local` with localhost API
- **Production**: Uses `.env.production` with production API URL
- **Vercel**: Uses environment variables set in Vercel dashboard

## Troubleshooting:
1. Check browser network tab for specific error messages
2. Verify environment variables are correctly set in Vercel
3. Ensure backend is running and accessible
4. Check that the DigitalOcean app includes the Vercel domain in CORS
