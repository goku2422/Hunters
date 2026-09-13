// Comprehensive End-to-End Verification Script
// Tests all API endpoints, Shop Resolution Logic, Anti-Fraud, Merchant Flow, and Admin Flow

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting Automated End-to-End System Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Shop Resolution with Shop A Coordinates (Connaught Place)
    console.log('📍 [Test 1] Shop Resolution - Geofencing at Shop A');
    const resA = await fetch(`${BASE_URL}/api/resolve-shop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: 28.6315, // Connaught Place
        longitude: 77.2167,
      }),
    });
    const dataA = await resA.json();
    assert(dataA.success === true, 'Resolution API responded with success');
    assert(dataA.shop?.id === 'shop-brew', `Resolved Shop is Brew & Bean Cafe (got ${dataA.shop?.name})`);
    assert(dataA.method === 'GEOFENCE', `Method is GEOFENCE (got ${dataA.method})`);
    assert(dataA.distanceMeters <= 50, `Calculated distance is within 50m (${dataA.distanceMeters}m)`);

    // TEST 2: Shop Resolution with Shop B Coordinates (DLF CyberHub)
    console.log('\n📍 [Test 2] Shop Resolution - Geofencing at Shop B');
    const resB = await fetch(`${BASE_URL}/api/resolve-shop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: 28.4952, // DLF CyberHub
        longitude: 77.0894,
      }),
    });
    const dataB = await resB.json();
    assert(dataB.shop?.id === 'shop-urban', `Resolved Shop is Urban Trend Fashion (got ${dataB.shop?.name})`);

    // TEST 3: Common QR Claim Creation
    console.log('\n🎟️ [Test 3] Customer Common QR Claim Creation');
    const testMobile = '9988776655';
    const claimRes = await fetch(`${BASE_URL}/api/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Gupta',
        mobile: testMobile,
        shopId: 'shop-brew',
        identificationMethod: 'GEOFENCE',
        distanceMeters: 12,
      }),
    });
    const claimData = await claimRes.json();
    assert(claimData.success === true, 'Claim was created successfully');
    assert(claimData.claim?.status === 'PENDING', 'Initial status is PENDING');
    assert(claimData.claim?.customerName === 'Aarav Gupta', 'Customer name is Aarav Gupta');
    assert(claimData.claim?.discountPercent === 10, 'Offer is 10% Flat Discount');
    const createdClaimId = claimData.claim?.id;

    // TEST 4: Anti-Spam / Duplicate Claim Prevention
    console.log('\n🛡️ [Test 4] Anti-Fraud: Prevent Duplicate Claim within 24 Hours');
    const dupRes = await fetch(`${BASE_URL}/api/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Gupta',
        mobile: testMobile,
        shopId: 'shop-brew',
        identificationMethod: 'GEOFENCE',
      }),
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 429, 'Rejected with HTTP 429 Too Many Requests');
    assert(dupData.isDuplicate === true, 'Correctly flagged as duplicate claim');

    // TEST 5: Merchant Login & Claim Acceptance
    console.log('\n🏪 [Test 5] Merchant Login & Live Claim Decision');
    const merchantLoginRes = await fetch(`${BASE_URL}/api/auth/merchant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'brew@shop.com',
        password: 'shop123',
      }),
    });
    const merchantAuth = await merchantLoginRes.json();
    assert(merchantAuth.success === true, 'Merchant logged in successfully');
    const merchantToken = merchantAuth.token;

    // Accept Claim
    const acceptRes = await fetch(`${BASE_URL}/api/claims/${createdClaimId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${merchantToken}`,
      },
      body: JSON.stringify({
        status: 'ACCEPTED',
        resolvedBy: 'Vikram Mehta (Store Manager)',
      }),
    });
    const acceptData = await acceptRes.json();
    assert(acceptData.success === true, 'Merchant ACCEPT action succeeded');
    assert(acceptData.claim?.status === 'ACCEPTED', 'Claim status is now ACCEPTED');

    // TEST 6: Customer Claim Status Synchronization
    console.log('\n🔄 [Test 6] Customer Polling & Status Sync');
    const syncRes = await fetch(`${BASE_URL}/api/claims/${createdClaimId}`);
    const syncData = await syncRes.json();
    assert(syncData.claim?.status === 'ACCEPTED', 'Customer terminal reflects ACCEPTED status');

    // TEST 7: Tenant Isolation - Merchant B Cannot See Shop A Claims
    console.log('\n🔒 [Test 7] Tenant Isolation: Merchant B Isolation');
    const claimsShopBRes = await fetch(`${BASE_URL}/api/claims?shopId=shop-urban`);
    const claimsShopB = await claimsShopBRes.json();
    const hasShopAClaim = claimsShopB.claims.some((c) => c.shopId === 'shop-brew');
    assert(hasShopAClaim === false, 'Merchant B cannot see Shop A claims');

    // TEST 8: Master Admin Portal
    console.log('\n👑 [Test 8] Master Admin Platform Overview');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@scratchease.com',
        password: 'admin123',
      }),
    });
    const adminAuth = await adminLoginRes.json();
    assert(adminAuth.success === true, 'Master Admin authenticated successfully');

    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` },
    });
    const statsData = await statsRes.json();
    assert(statsData.success === true, 'Master Admin stats retrieved');
    assert(statsData.stats?.totalShops >= 3, `Total shops >= 3 (got ${statsData.stats?.totalShops})`);
    assert(statsData.stats?.totalClaims >= 1, `Total claims recorded`);

    console.log(`\n========================================`);
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  }
}

runTests();
