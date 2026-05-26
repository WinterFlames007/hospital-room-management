const request = require('supertest');
const app = require('../app');

describe('Security Route Tests', () => {

    test('should reject SQL injection login attempt', async () => {

        const response = await request(app)
            .post('/login')
            .send({
                email: "' OR 1=1 --",
                password: 'anything'
            });

        expect(response.text)
            .toContain('User Not Found');

    });

    test('should reject invalid form input on login', async () => {

        const response = await request(app)
            .post('/login')
            .send({
                email: '',
                password: ''
            });

        expect(response.statusCode)
            .toBe(400);

    });

    test('should block unauthorized access attempt to patient page', async () => {

        const response = await request(app)
            .get('/patients');

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });

});

afterAll(() => {

    const db = require('../config/db');

    db.end();

});