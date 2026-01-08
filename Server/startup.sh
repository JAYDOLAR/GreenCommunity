#!/bin/bash

# Azure App Service startup script for Node.js + Next.js
echo "🚀 Starting Green Community Application..."

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-8080}

# Debug information
echo "📍 Current directory: $(pwd)"
echo "🌍 NODE_ENV: $NODE_ENV"
echo "� PORT: $PORT"

# Check directory structure
echo "�📁 Directory contents:"
ls -la

# Check for required files
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found!"
    exit 1
fi

if [ ! -d "client" ]; then
    echo "❌ client directory not found!"
    exit 1
fi

# Install server dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm ci --omit=dev --legacy-peer-deps --silent
fi

# Install client dependencies if needed
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm ci --omit=dev --silent && cd ..
fi

# Verify Next.js build exists
if [ ! -d "client/.next" ]; then
    echo "❌ Next.js build not found in client/.next"
    exit 1
else
    echo "✅ Next.js build found"
fi

# Start the application
echo "🎯 Starting server on port $PORT"
node server.js
