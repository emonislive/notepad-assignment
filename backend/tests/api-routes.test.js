const request = require('supertest');
const app = require('../src/app');

describe('API Route & Error Handling Integration', () => {
  test('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });

  test('Undefined routes return 404 with error message', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  test('POST /api/auth/register validates required fields and returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' }); // missing username and password

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('POST /api/auth/login validates required fields and returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' }); // missing password

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('GET /api/notes without authorization token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Authentication required/i);
  });

  test('GET /api/users without authorization token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Authentication required/i);
  });
});
