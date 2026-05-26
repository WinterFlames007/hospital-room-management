const request = require('supertest');
const app = require('../app');

describe('Login Route Tests', () => {

    test('should reject unknown user', async () => {

        const response = await request(app)
            .post('/login')
            .send({
                email: 'wrong@email.com',
                password: 'wrongpassword'
            });

        expect(response.text)
            .toContain('User Not Found');
    });


    test('should block dashboard access if not logged in', async () => {

        const response = await request(app)
            .get('/');

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });


    test('should reject invalid password', async () => {

        const response = await request(app)
            .post('/login')
            .send({
                email: 'staff@hospital.com',
                password: 'wrongpassword'
            });

        expect(response.text)
            .toContain('Invalid Password');

    });

    test('should login successfully with valid credentials', async () => {

        const response = await request(app)
            .post('/login')
            .send({
                email: 'staff@hospital.com',
                password: 'staff@hospital.com'
            });

        expect(response.statusCode)
            .toBe(302);

    });


    test('should reject empty login fields', async () => {

        const response = await request(app)
            .post('/login')
            .send({
                email: '',
                password: ''
            });

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(400);

    });


    test('should logout successfully', async () => {

        const response = await request(app)
            .get('/logout');

        expect(response.statusCode)
            .toBe(302);

    });



    test('should block patient route access if not logged in', async () => {

        const response = await request(app)
            .get('/patients');

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });


    test('should block admin-only patient delete route if not logged in', async () => {

        const response = await request(app)
            .post('/patients/delete/1');

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });


    test('should maintain session after successful login', async () => {

        const agent = request.agent(app);

        const loginResponse = await agent
            .post('/login')
            .send({
                email: 'staff@hospital.com',
                password: 'staff@hospital.com'
            });

        expect(loginResponse.statusCode)
            .toBe(302);

        const dashboardResponse = await agent
            .get('/');

        expect(dashboardResponse.statusCode)
            .toBe(200);

    });


});
afterAll(() => {

    const db = require('../config/db');

    db.end();

});