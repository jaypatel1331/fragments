// tests/unit/delete.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/111').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .delete('/v1/fragments/111')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // if user tries to access the id which is not owned by him, it will return 404
  test('user cannot delete Id that is not owned by him', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');
    const id = res.id;

    const res2 = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user2@email.com', 'password2');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
  });

  // check the status code of fragent deletion
  test('check the status of fragment deletion', async () => {
    const data = Buffer.from('This is fragment');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send(data);
    var fragmentData = JSON.parse(postRes.text);
    const id = fragmentData.fragment.id;

    const getRes = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
  });

  // test the fragment is deleted in database
  test('check the fragment is deleted in database', async () => {
    const data = Buffer.from('This is fragment');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send(data);
    var fragmentData = JSON.parse(postRes.text);
    const id = fragmentData.fragment.id;

    await request(app).delete(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(404);
  });
});
