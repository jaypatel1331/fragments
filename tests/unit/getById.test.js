const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  // unahtenticated requests should receive 401 error
  test('unauthenticated requests should receive 401 error', () =>
    request(app).get('/v1/fragments/anyid').expect(401));

  // incorrect credentials should receive 401 error
  test('incorrect credentials should receive 401 error', () =>
    request(app).get('/v1/fragments/anyid').auth('jaypatel@email.com', 'jaypatel').expect(401));

  // if the id doesn't exist, it will return 404
  test('if the id do not exist it will return 404', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');
    const res2 = await request(app)
      .get(`/v1/fragments/someRandomId`)
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

    const res2 = await request(app).get(`/v1/fragments/${id}`).auth('user2@email.com', 'password2');

    expect(res2.statusCode).toBe(404);
    expect(res2.body.status).toBe('error');
  });

  // check the return value of the specific fragment
  test('check the return value of the user and its fragment id', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');

    // parse the response to get the id from the json response
    const jsondata = JSON.parse(res.text);
    const id = jsondata.fragment.id;

    const res2 = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(200);
    expect(res2.text).toBe('this is the value');
  });

  // if the url contains ".txt" extension, it will check the content
  test('url with ".txt" extension will return the content', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('this is the value');

    // parse the response to get the id from the json response
    const jsondata = JSON.parse(res.text);
    const id = jsondata.fragment.id;

    const res2 = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth('user1@email.com', 'password1');

    expect(res2.statusCode).toBe(200);
    expect(res2.text).toBe('this is the value');
  });
});
