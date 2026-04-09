#!/bin/bash

# DocumentChain - Backend Test Script
# Tests all major API endpoints

echo "🧪 DocumentChain Backend API Test"
echo "=================================="
echo ""

# Configuration
API_URL="https://localhost:3000/api"
INSECURE="--insecure"  # For self-signed SSL certificates

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth=$5
    
    echo -n "Testing: $name... "
    
    if [ -n "$auth" ]; then
        AUTH_HEADER="-H \"Authorization: Bearer $auth\""
    else
        AUTH_HEADER=""
    fi
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -X GET "$API_URL$endpoint" $AUTH_HEADER $INSECURE)
    else
        response=$(curl -s -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            $AUTH_HEADER \
            -d "$data" \
            $INSECURE)
    fi
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "📡 1. Testing Health Check"
echo "-------------------------"
curl -s https://localhost:3000/health $INSECURE | jq . || echo "Server not running!"
echo ""

echo "🔐 2. Testing Authentication"
echo "----------------------------"

# Register user
echo -n "Registering user alice... "
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "alice",
        "email": "alice@test.com",
        "password": "password123",
        "fullName": "Alice Test"
    }' \
    $INSECURE)

if echo "$REGISTER_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  Token: ${TOKEN:0:20}..."
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Response: $REGISTER_RESPONSE"
    FAILED=$((FAILED + 1))
    echo ""
    echo "❌ Cannot continue without authentication token"
    exit 1
fi

# Login
echo -n "Login with alice... "
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "alice",
        "password": "password123"
    }' \
    $INSECURE)

if echo "$LOGIN_RESPONSE" | jq -e '.token' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Get current user
echo -n "Get current user... "
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
    -H "Authorization: Bearer $TOKEN" \
    $INSECURE)

if echo "$ME_RESPONSE" | jq -e '.user' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "👤 3. Testing User Management"
echo "-----------------------------"

# Get profile
echo -n "Get user profile... "
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/users/profile" \
    -H "Authorization: Bearer $TOKEN" \
    $INSECURE)

if echo "$PROFILE_RESPONSE" | jq -e '.user.username' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Update profile
echo -n "Update profile... "
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/users/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"fullName": "Alice Updated"}' \
    $INSECURE)

if echo "$UPDATE_RESPONSE" | jq -e '.user' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Search users
echo -n "Search users... "
SEARCH_RESPONSE=$(curl -s -X GET "$API_URL/users/search?q=alice" \
    -H "Authorization: Bearer $TOKEN" \
    $INSECURE)

if echo "$SEARCH_RESPONSE" | jq -e '.users' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "💳 4. Testing Wallet Management"
echo "-------------------------------"

# Get challenge
echo -n "Get wallet challenge... "
CHALLENGE_RESPONSE=$(curl -s -X POST "$API_URL/wallets/challenge" \
    -H "Content-Type: application/json" \
    -d '{"address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}' \
    $INSECURE)

if echo "$CHALLENGE_RESPONSE" | jq -e '.message' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# Add wallet (without signature for now)
echo -n "Add wallet... "
WALLET_RESPONSE=$(curl -s -X POST "$API_URL/wallets" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "label": "Test Wallet"
    }' \
    $INSECURE)

if echo "$WALLET_RESPONSE" | jq -e '.wallet' > /dev/null 2>&1; then
    WALLET_ID=$(echo "$WALLET_RESPONSE" | jq -r '.wallet.id')
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  Wallet ID: $WALLET_ID"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

# List wallets
echo -n "List wallets... "
WALLETS_RESPONSE=$(curl -s -X GET "$API_URL/wallets" \
    -H "Authorization: Bearer $TOKEN" \
    $INSECURE)

if echo "$WALLETS_RESPONSE" | jq -e '.wallets' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "📊 5. Testing Statistics"
echo "-----------------------"

# Get user stats
echo -n "Get user stats... "
STATS_RESPONSE=$(curl -s -X GET "$API_URL/stats/me" \
    -H "Authorization: Bearer $TOKEN" \
    $INSECURE)

if echo "$STATS_RESPONSE" | jq -e '.stats' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "📋 6. Testing Document Operations"
echo "---------------------------------"
echo -e "${YELLOW}Note: Document upload requires actual files and blockchain connection${NC}"
echo -e "${YELLOW}Skipping document tests in quick test mode${NC}"

echo ""
echo "=================================="
echo "📊 Test Results"
echo "=================================="
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi
