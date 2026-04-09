#!/bin/bash

# Script para probar el flujo completo de autenticación
# Usage: ./test-auth-flow.sh

API_URL="https://localhost:3000/api"
TEST_USER="testuser_$(date +%s)"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPass123"

echo "🧪 Testing Authentication Flow"
echo "=============================="
echo ""

# 1. Register
echo "1️⃣  Testing REGISTER..."
REGISTER_RESPONSE=$(curl -s -k -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USER\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"fullName\": \"Test User\"
  }")

echo "Response: $REGISTER_RESPONSE" | jq '.'

ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.refreshToken')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')

if [ "$ACCESS_TOKEN" != "null" ]; then
  echo "✅ Register successful - Access token received"
else
  echo "❌ Register failed"
  exit 1
fi

echo ""

# 2. Make authenticated request
echo "2️⃣  Testing AUTHENTICATED REQUEST (get profile)..."
PROFILE_RESPONSE=$(curl -s -k -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $PROFILE_RESPONSE" | jq '.'

if echo "$PROFILE_RESPONSE" | jq -e '.user' > /dev/null; then
  echo "✅ Authenticated request successful"
else
  echo "❌ Authenticated request failed"
  exit 1
fi

echo ""

# 3. Test refresh token
echo "3️⃣  Testing REFRESH TOKEN..."
REFRESH_RESPONSE=$(curl -s -k -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "Response: $REFRESH_RESPONSE" | jq '.'

NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ]; then
  echo "✅ Token refresh successful"
  ACCESS_TOKEN=$NEW_ACCESS_TOKEN
else
  echo "❌ Token refresh failed"
  exit 1
fi

echo ""

# 4. Test with refreshed token
echo "4️⃣  Testing REQUEST WITH REFRESHED TOKEN..."
PROFILE_RESPONSE_2=$(curl -s -k -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response: $PROFILE_RESPONSE_2" | jq '.'

if echo "$PROFILE_RESPONSE_2" | jq -e '.user' > /dev/null; then
  echo "✅ Request with refreshed token successful"
else
  echo "❌ Request with refreshed token failed"
  exit 1
fi

echo ""

# 5. Test rate limiting (auth endpoints)
echo "5️⃣  Testing RATE LIMITING (should fail after 5 attempts)..."
for i in {1..6}; do
  LOGIN_RESPONSE=$(curl -s -k -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"invalid$i\", \"password\": \"invalid\"}")
  
  if echo "$LOGIN_RESPONSE" | grep -q "Too many"; then
    echo "✅ Rate limiting working (attempt $i blocked)"
    break
  else
    echo "   Attempt $i..."
  fi
done

echo ""

# 6. Test logout
echo "6️⃣  Testing LOGOUT..."
LOGOUT_RESPONSE=$(curl -s -k -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "Response: $LOGOUT_RESPONSE" | jq '.'

if echo "$LOGOUT_RESPONSE" | jq -e '.message' > /dev/null; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed"
fi

echo ""

# 7. Test that refresh token is revoked
echo "7️⃣  Testing REVOKED REFRESH TOKEN (should fail)..."
REFRESH_RESPONSE_2=$(curl -s -k -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "Response: $REFRESH_RESPONSE_2" | jq '.'

if echo "$REFRESH_RESPONSE_2" | jq -e '.error' > /dev/null; then
  echo "✅ Revoked token correctly rejected"
else
  echo "❌ Revoked token was not rejected"
fi

echo ""
echo "=============================="
echo "✅ All tests completed!"
