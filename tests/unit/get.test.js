// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // unathenticated requests should receive 401 error
  test('unauthenticated requests receive 401 error', () =>
    request(app).get('/v1/fragments').expect(401));

  // incorrect credentials should receive 401 error
  test('incorrect credentials receive 401 error', () =>
    request(app).get('/v1/fragments').auth('jaypatel@email.com', 'jaypatel').expect(401));

  // authenticated users should receive array
  test('authenticated users should receive an array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
});
