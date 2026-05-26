const request = require('supertest');
const app = require('../app');

describe('Patient Route Tests', () => {

    test('should block patient creation if not logged in', async () => {

        const response = await request(app)
            .post('/patients/add')
            .send({
                full_name: 'Test Patient',
                age: 30
            });

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });




    test('should reject patient creation with missing required fields', async () => {

        const response = await request(app)
            .post('/patients/add')
            .send({});

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });


    test('should reject invalid patient data', async () => {

        const response = await request(app)
            .post('/patients/add')
            .send({
                full_name: '',
                age: -5,
                symptoms: '',
                infection_risk: 'Invalid',
                isolation_priority: 'Invalid'
            });

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });

































});

afterAll(() => {

    const db = require('../config/db');

    db.end();

});