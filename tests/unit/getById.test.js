const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/anyid').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/anyid')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // the return value will return 404 if the id doesn't not exist
  test('Not exist id will return 404', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');
    const res2 = await request(app)
      .get(`/v1/fragments/notRealId`)
      .auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
  });

  // the return value will return 404 if the fragment doesn't belong to the user
  test('Not owned id will return 404', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');
    const id = res.id;

    const res2 = await request(app).get(`/v1/fragments/${id}`).auth('user2@email.com', 'password2');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
  });

  // test for the return value of the fragment
  test('Return value of the fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');

    const jsondata = JSON.parse(res.text);
    const id = jsondata.fragment[0].id;

    const res2 = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(200);
    expect(res2.text).toBe('this is the value');
  });
});
