#!/bin/bash
set -e

echo "Checking server health status..."

# First try the local development server
LOCAL_URL="http://localhost:5000/health"
echo "Checking local development server: $LOCAL_URL"

LOCAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $LOCAL_URL 2>/dev/null || echo "Failed")

if [ "$LOCAL_STATUS" = "200" ]; then
  echo "✅ Local development server is running and healthy!"
  
  # Try to fetch actual response
  RESPONSE=$(curl -s $LOCAL_URL)
  echo "Response: $RESPONSE"
else
  echo "❌ Local development server is not accessible (status: $LOCAL_STATUS)"
fi

# Check for production domain if provided
if [ -n "$1" ]; then
  PROD_URL="https://$1/health"
  echo ""
  echo "Checking production domain: $PROD_URL"
  
  PROD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL 2>/dev/null || echo "Failed")
  
  if [ "$PROD_STATUS" = "200" ]; then
    echo "✅ Production server is running and healthy!"
    
    # Try to fetch actual response
    RESPONSE=$(curl -s $PROD_URL)
    echo "Response: $RESPONSE"
  else
    echo "❌ Production server is not accessible (status: $PROD_STATUS)"
    echo ""
    echo "Possible issues:"
    echo "1. The server might not be running"
    echo "2. There might be a problem with the deployment"
    echo "3. DNS might not be properly configured"
    echo "4. SSL certificate might not be ready yet"
    echo ""
    echo "Try checking the Replit deployment logs for more details."
  fi
else
  echo ""
  echo "To check a production domain, run with domain parameter:"
  echo "./scripts/check-server-health.sh your-domain.com"
fi