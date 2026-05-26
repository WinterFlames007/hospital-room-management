const request = require('supertest');
const app = require('../app');

describe('Room Route Tests', () => {

    test('should block room creation if not logged in', async () => {

        const response = await request(app)
            .post('/rooms/add')
            .send({
                room_number: '101',
                room_type: 'Isolation',
                capacity: 2
            });

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });



    test('should reject duplicate room creation if not logged in', async () => {

        const response = await request(app)
            .post('/rooms/add')
            .send({
                room_number: 'Room 1',
                room_type: 'Isolation',
                capacity: 1
            });

        expect(response.statusCode)
            .toBeGreaterThanOrEqual(300);

    });











});

afterAll(() => {

    const db = require('../config/db');

    db.end();

});