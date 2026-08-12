const assert = require('assert');

async function runTests() {
  console.log("Starting API Tests...\n");
  
  try {
    // 1. Test Authentication
    console.log("Testing POST /api/auth/login...");
    let res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser@gmail.com", password: "password123" })
    });
    let data = await res.json();
    assert.strictEqual(res.status, 200, "Should return 200 OK");
    assert.strictEqual(data.success, true, "Should return success true");
    assert.ok(data.data.token, "Should return a JWT token");
    const token = data.data.token;
    console.log("✅ Authentication Test Passed\n");

    // 2. Test Protected Assets Route
    console.log("Testing GET /api/assets...");
    res = await fetch("http://localhost:8080/api/assets", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    data = await res.json();
    assert.strictEqual(res.status, 200, "Should return 200 OK");
    assert.strictEqual(data.success, true, "Should return success true");
    assert.ok(Array.isArray(data.data), "Should return an array of assets");
    console.log("✅ Assets Route Test Passed\n");

    // 3. Test Protected Dashboard Route
    console.log("Testing GET /api/assets/dashboard...");
    res = await fetch("http://localhost:8080/api/assets/dashboard", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    data = await res.json();
    assert.strictEqual(res.status, 200, "Should return 200 OK");
    assert.ok(data.data.TOTAL >= 0, "Should return TOTAL metric");
    console.log("✅ Dashboard Route Test Passed\n");

    // 4. Test Protected Employees Route
    console.log("Testing GET /api/employees...");
    res = await fetch("http://localhost:8080/api/employees", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    data = await res.json();
    assert.strictEqual(res.status, 200, "Should return 200 OK");
    assert.strictEqual(data.success, true, "Should return success true");
    assert.ok(Array.isArray(data.data), "Should return an array of employees");
    console.log("✅ Employees Route Test Passed\n");

    // 5. Test Unauthorized Access
    console.log("Testing Unauthorized Access...");
    res = await fetch("http://localhost:8080/api/assets");
    data = await res.json();
    assert.strictEqual(res.status, 401, "Should return 401 Unauthorized");
    assert.strictEqual(data.success, false, "Should return success false");
    console.log("✅ Unauthorized Access Test Passed\n");

    console.log("🎉 ALL API TESTS PASSED SUCCESSFULLY");
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
    process.exit(1);
  }
}

runTests();
