#!/bin/bash

# Azure App Service startup script for Node.js + Next.js
echo "🚀 Starting Green Community Application..."

# Set environment
export NODE_ENV=production
export PORT=${PORT:-8080}

# Debug information
echo "📍 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

echo "📁 Client directory check:"
if [ -d "client" ]; then
    echo "✅ Client directory found"
    ls -la client/
    if [ -d "client/src" ]; then
        echo "✅ Client src directory found"
        ls -la client/src/
    else
        echo "❌ Client src directory not found"
    fi
else
    echo "❌ Client directory not found"
fi

# Start the application
echo "🎯 Starting server with: npm start"
npm start
