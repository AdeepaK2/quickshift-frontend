#!/bin/bash

# This is a helper script for Vercel deployment

# Make sure we're using Node.js compatibility
export NODE_OPTIONS="--max-old-space-size=4096"

# Build the Next.js application
npm run build

# Success message
echo "Build completed successfully!"
