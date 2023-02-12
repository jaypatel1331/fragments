const request = require('supertest');

const app = require('../../src/app');

// test for the 404 error
describe('check for 404 error in app.js', () => {
  test('app routes checking for the app.js', async () => {
    const res = await request(app).get('/...');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
  });
});
