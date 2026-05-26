const request = require('supertest');
const app = require('../app');

describe('Assignment Route Tests', () => {

    test('should block patient assignment if not logged in', async () => {

        const response = await request(app)
            .post('/assignments/add')
            .send({
                patient_id: 1,
                room_id: 1
            });

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });

    test('should block invalid assignment if not logged in', async () => {

        const response = await request(app)
            .post('/assignments/add')
            .send({
                patient_id: '',
                room_id: ''
            });

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });

});

afterAll(() => {

    const db = require('../config/db');

    db.end();

});