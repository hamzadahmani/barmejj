/* Read-only discovery smoke checks; the temporary login session is revoked at the end. */
const assert = require('node:assert/strict');
const base = process.env.EXPLORER_API_URL || 'http://127.0.0.1:8091';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('These checks must target the local backend.');
const email = process.env.EXPLORER_TEST_EMAIL;
const password = process.env.EXPLORER_TEST_PASSWORD;
if (!email || !password) throw new Error('Set EXPLORER_TEST_EMAIL and EXPLORER_TEST_PASSWORD to a local test account.');

async function main() {
  const login = await fetch(`${base}/authenticate`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userMail: email, userPwd: password})});
  assert.equal(login.status, 200, 'Test account login');
  const session = await login.json();
  const headers = {Authorization: `Bearer ${session.token}`};
  const get = async endpoint => {
    const response = await fetch(`${base}${endpoint}`, {headers});
    assert.equal(response.status, 200, endpoint);
    return response.json();
  };
  try {
    const data = await get('/v1/discovery?latitude=36.8&longitude=10.1');
    assert.equal(data.interests.length, 12);
    for (const interest of data.interests) {
      const places = await get(`/v1/discovery?interest=${interest.key}`);
      assert.ok(places.every(place => place.interests.includes(interest.key)), interest.key);
    }
    for (const place of data.forYou) {
      assert.ok(place.reviewCount > 0 ? place.rating >= 1 && place.rating <= 5 : place.rating === null);
    }
    for (const place of data.availableNow) {
      const availability = await get(`/places/${place.idPlace}/availability?date=${place.availableDate}&guests=2`);
      assert.ok(availability.slots.some(slot => slot.time === place.availableTime && slot.available), `Available slot for ${place.idPlace}`);
    }
    assert.ok(data.nearby.length <= 3 && data.nearby.every(place => place.distance >= 0 && place.distance <= 20));
    assert.ok(data.newPlaces.every(place => Date.now() - Date.parse(place.createdAt) <= 30 * 86400000));
    const cheap = await get('/search?maxPrice=40&sort=price');
    assert.ok(cheap.every(place => place.averagePrice != null && place.averagePrice <= 40));
    const invalid = await fetch(`${base}/v1/discovery?interest=invalid`, {headers});
    assert.equal(invalid.status, 400);
    const unauthenticated = await fetch(`${base}/v1/discovery`);
    assert.equal(unauthenticated.status, 401);
    console.log(JSON.stringify({status: 'passed', interests: 12, recommendations: data.forYou.length, availableSlots: data.availableNow.length, nearby: data.nearby.length, events: data.events.length, offers: data.offers.length}, null, 2));
  } finally {
    await fetch(`${base}/auth/logout`, {method: 'POST', headers: {'Content-Type': 'application/json', ...headers}, body: JSON.stringify({refreshToken: session.refreshToken})});
  }
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
