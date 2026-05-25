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
                email: 'admin@hospital.com',
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




});
afterAll(() => {

    const db = require('../config/db');

    db.end();

});