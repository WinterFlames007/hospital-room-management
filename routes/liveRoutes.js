const express = require('express');

const router = express.Router();

const db = require('../config/db');

router.get(
    '/global-search',
    (req, res) => {

        const search =
            req.query.search || '';

        if (!search) {

            return res.json({
                patients: [],
                rooms: [],
                assignments: [],
                users: [],
                notifications: []
            });
        }

        /* =========================================
           PATIENTS
        ========================================= */

        const patientSql = `
            SELECT
                patient_id,
                full_name,
                infection_risk
            FROM patients
            WHERE
                full_name LIKE ?
                OR symptoms LIKE ?
            LIMIT 5
        `;

        /* =========================================
           ROOMS
        ========================================= */

        const roomSql = `
            SELECT
                room_id,
                room_number,
                room_type
            FROM rooms
            WHERE
                room_number LIKE ?
            LIMIT 5
        `;











        /* =========================================
        AVAILABLE ROOMS
        ========================================= */

        const availableSql = `
            SELECT COUNT(*) AS availableRooms
            FROM rooms
            WHERE availability_status='Available'
        `;

        /* =========================================
        OCCUPIED ROOMS
        ========================================= */

        const occupiedSql = `
            SELECT COUNT(*) AS occupiedRooms
            FROM rooms
            WHERE availability_status='Occupied'
        `;

        /* =========================================
        HIGH PRIORITY CASES
        ========================================= */

        const prioritySql = `
            SELECT COUNT(*) AS highPriorityCases
            FROM patients
            WHERE isolation_priority='High'
        `;



        /* =========================================
           ASSIGNMENTS
        ========================================= */

        const assignmentSql = `
            SELECT
                patients.full_name AS patient_name,
                rooms.room_number
            FROM assignments
            JOIN patients
                ON assignments.patient_id = patients.patient_id
            JOIN rooms
                ON assignments.room_id = rooms.room_id
            WHERE
                patients.full_name LIKE ?
                OR rooms.room_number LIKE ?
            LIMIT 5
        `;

        /* =========================================
           USERS
        ========================================= */

        const userSql = `
            SELECT
                user_id,
                full_name,
                email
            FROM users
            WHERE
                full_name LIKE ?
                OR email LIKE ?
            LIMIT 5
        `;

        /* =========================================
           NOTIFICATIONS
        ========================================= */

        const notificationSql = `
            SELECT
                title,
                message
            FROM notifications
            WHERE
                title LIKE ?
                OR message LIKE ?
            LIMIT 5
        `;

        const value =
            `%${search}%`;

        /* =========================================
           EXECUTE QUERIES
        ========================================= */

        db.query(
            patientSql,
            [value, value],
            (err, patients) => {

                if (err) {

                    console.log(err);

                    return res.json({
                        error: true
                    });
                }

                db.query(
                    roomSql,
                    [value],
                    (err, rooms) => {

                        db.query(
                            assignmentSql,
                            [value, value],
                            (err, assignments) => {

                                db.query(
                                    userSql,
                                    [value, value],
                                    (err, users) => {

                                        db.query(
                                            notificationSql,
                                            [value, value],
                                            (err, notifications) => {

                                                res.json({

                                                    patients,

                                                    rooms,

                                                    assignments,

                                                    users,

                                                    notifications
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);

/* =========================================
   LIVE DASHBOARD STATS
========================================= */

router.get(
    '/stats',
    (req, res) => {

        /* =========================================
           TOTAL PATIENTS
        ========================================= */

        const patientSql = `
            SELECT COUNT(*) AS totalPatients
            FROM patients
        `;

        /* =========================================
           TOTAL ROOMS
        ========================================= */

        const roomSql = `
            SELECT COUNT(*) AS totalRooms
            FROM rooms
        `;


        /* =========================================
        AVAILABLE ROOMS
        ========================================= */

        const availableSql = `
            SELECT COUNT(*) AS availableRooms
            FROM rooms
            WHERE availability_status='Available'
        `;

        /* =========================================
        OCCUPIED ROOMS
        ========================================= */

        const occupiedSql = `
            SELECT COUNT(*) AS occupiedRooms
            FROM rooms
            WHERE availability_status='Occupied'
        `;

        /* =========================================
        HIGH PRIORITY CASES
        ========================================= */

        const prioritySql = `
            SELECT COUNT(*) AS highPriorityCases
            FROM patients
            WHERE isolation_priority='High'
        `;





        /* =========================================
           ACTIVE ASSIGNMENTS
        ========================================= */

        const assignmentSql = `
            SELECT COUNT(*) AS activeAssignments
            FROM assignments
            WHERE status='Active'
        `;

        db.query(
            patientSql,
            (err, patientResults) => {

                if (err) {

                    console.log(err);

                    return res.json({
                        error: true
                    });
                }

                db.query(
                    roomSql,
                    (err, roomResults) => {

                        if (err) {

                            console.log(err);

                            return res.json({
                                error: true
                            });
                        }


                        db.query(
                            availableSql,
                            (err, availableResults) => {

                                if (err) {

                                    console.log(err);

                                    return res.json({
                                        error: true
                                    });
                                }

                                db.query(
                                    occupiedSql,
                                    (err, occupiedResults) => {

                                        if (err) {

                                            console.log(err);

                                            return res.json({
                                                error: true
                                            });
                                        }

                                        db.query(
                                            prioritySql,
                                            (err, priorityResults) => {

                                                if (err) {

                                                    console.log(err);

                                                    return res.json({
                                                        error: true
                                                    });
                                                }

                                                db.query(
                                                    assignmentSql,
                                                    (err, assignmentResults) => {

                                                        if (err) {

                                                            console.log(err);

                                                            return res.json({
                                                                error: true
                                                            });
                                                        }

                                                        res.json({

                                                            totalPatients:
                                                                patientResults[0].totalPatients,

                                                            totalRooms:
                                                                roomResults[0].totalRooms,

                                                            availableRooms:
                                                                availableResults[0].availableRooms,

                                                            occupiedRooms:
                                                                occupiedResults[0].occupiedRooms,

                                                            highPriorityCases:
                                                                priorityResults[0].highPriorityCases,

                                                            activeAssignments:
                                                                assignmentResults[0].activeAssignments
                                                        });
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);

module.exports = router;