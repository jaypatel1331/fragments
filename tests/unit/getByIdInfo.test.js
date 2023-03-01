const request = require('supertest');

const app = require('../../src/app');
//const logger = require('../../src/logger');

describe('GET /v1/fragments/:id/info', () => {
  // unautenticated requests should receive 401 error
  test('unauthenticated requests should receive 401 error', () =>
    request(app).get('/v1/fragments/12345/info').expect(401));

  // incorrect credentials should receive 401 error
  test('incorrect credentials should receive 401 error', () =>
    request(app)
      .get('/v1/fragments/anyid/info')
      .auth('jaypatel@email.com', 'jaypatel')
      .expect(401));

  // if the id doesn't exist, it will return 404
  test('if the id do not exist it will return 404', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');
    const res2 = await request(app)
      .get(`/v1/fragments/someRandomId/info`)
      .auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
  });

  // if user tries to access the id which is not owned by him, it will return 404
  test('id not owned by the user can not access the id of other fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');
    const id = res.id;

    const res2 = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user2@email.com', 'password2');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
  });

  // authenticated users get a fragments array
  test('authenticated users get a fragments array', async () => {
    const data = Buffer.from('This is fragment');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    var jsondata = JSON.parse(postRes.text);
    var id = jsondata.fragment.id;
    var correct = JSON.parse(postRes.text).fragment;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    var result = JSON.parse(getRes.text).fragments;
    expect(result).toStrictEqual(correct);
  });
});
