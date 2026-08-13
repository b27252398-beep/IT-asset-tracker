const assert = require('assert');

const BASE_URL = 'http://localhost:8080/api';

async function runTests() {
  console.log("Starting integration tests for Node.js Mock Backend...");
  
  try {
    // 1. Test Login
    console.log("Testing POST /api/auth/login");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password' })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.data.token, "Token should be present");
    const token = loginData.data.token;
    console.log("✅ Login successful");

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test Employees
    console.log("Testing GET /api/employees");
    const getEmp = await fetch(`${BASE_URL}/employees`, { headers: authHeaders });
    assert.strictEqual(getEmp.status, 200);
    const getEmpData = await getEmp.json();
    assert.ok(Array.isArray(getEmpData.data));
    console.log("✅ GET /employees successful");

    console.log("Testing POST /api/employees");
    const newEmp = { name: "Test Employee", email: "test@company.com", department: "Engineering", role: "Developer" };
    const postEmp = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newEmp)
    });
    assert.strictEqual(postEmp.status, 201);
    const postEmpData = await postEmp.json();
    assert.strictEqual(postEmpData.data.name, "Test Employee");
    console.log("✅ POST /employees successful");

    // 3. Test Assets
    console.log("Testing GET /api/assets");
    const getAssets = await fetch(`${BASE_URL}/assets`, { headers: authHeaders });
    assert.strictEqual(getAssets.status, 200);
    const getAssetsData = await getAssets.json();
    assert.ok(Array.isArray(getAssetsData.data));
    console.log("✅ GET /assets successful");

    console.log("Testing POST /api/assets");
    const newAsset = { name: "Test Asset", assetTag: "TAG-TEST", category: "LAPTOP", location: "NY" };
    const postAsset = await fetch(`${BASE_URL}/assets`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newAsset)
    });
    assert.strictEqual(postAsset.status, 201);
    const postAssetData = await postAsset.json();
    assert.strictEqual(postAssetData.name, "Test Asset");
    console.log("✅ POST /assets successful");

    console.log("\n🎉 All integration tests passed successfully! The backend is fully functional.");
  } catch (error) {
    console.error("\n❌ Integration tests failed!");
    console.error(error);
    process.exit(1);
  }
}

runTests();
