#!/bin/bash

# Search API Verification Script
# Tests the fixed search functionality

echo "🔍 Testing Search API Fix..."
echo "================================"

# Function to test API endpoint
test_endpoint() {
    local url="$1"
    local description="$2"
    
    echo "Testing: $description"
    echo "URL: $url"
    
    # Test with curl
    response=$(curl -s -w "\n%{http_code}" "$url" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${AUTH_TOKEN:-}")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "200" ]; then
        echo "✅ Status: $status_code (Success)"
        # Parse JSON to get course count
        course_count=$(echo "$body" | grep -o '"courses":\[.*\]' | grep -o '\[.*\]' | grep -o ',' | wc -l)
        course_count=$((course_count + 1))
        echo "📚 Found courses: $course_count"
    else
        echo "❌ Status: $status_code (Error)"
        echo "Response: $body"
    fi
    echo "---"
}

# Wait for server to be ready
echo "Waiting for server..."
for i in {1..10}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    echo "⏳ Waiting... ($i/10)"
    sleep 2
done

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Server is not running on localhost:3000"
    echo "Please start the development server with: pnpm dev"
    exit 1
fi

# Test endpoints
BASE_URL="http://localhost:3000/api/courses"

echo ""
echo "🧪 Running Search Tests..."
echo "================================"

# Test 1: Basic browsing (no search)
test_endpoint "${BASE_URL}?browsing=true" "Basic course browsing"

# Test 2: The original failing search
test_endpoint "${BASE_URL}?browsing=true&search=complete%20react" "Original failing search: 'complete react'"

# Test 3: Simple search terms
test_endpoint "${BASE_URL}?browsing=true&search=javascript" "Simple search: 'javascript'"
test_endpoint "${BASE_URL}?browsing=true&search=python" "Simple search: 'python'"
test_endpoint "${BASE_URL}?browsing=true&search=web" "Simple search: 'web'"

# Test 4: Multi-word searches
test_endpoint "${BASE_URL}?browsing=true&search=web%20development" "Multi-word search: 'web development'"
test_endpoint "${BASE_URL}?browsing=true&search=data%20science" "Multi-word search: 'data science'"

# Test 5: Special characters
test_endpoint "${BASE_URL}?browsing=true&search=node.js" "Special chars: 'node.js'"
test_endpoint "${BASE_URL}?browsing=true&search=c%2B%2B" "Special chars: 'c++'"

# Test 6: Case sensitivity
test_endpoint "${BASE_URL}?browsing=true&search=REACT" "Case test: 'REACT'"
test_endpoint "${BASE_URL}?browsing=true&search=React" "Case test: 'React'"

echo ""
echo "🎉 Search API testing completed!"
echo "================================"
echo ""
echo "If all tests show ✅ Status: 200, the search fix is working!"
echo "If any tests show ❌ Status: 500, there are still issues to fix."
