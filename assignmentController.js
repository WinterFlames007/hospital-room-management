const db = require('../config/db');

const createNotification =
    require('../utils/createNotification');

const createActivity =
    require('../utils/createActivity');



const getAssignments = (req, res) => {

    /* =========================================
       QUERY VALUES
    ========================================= */

    const search =
        req.query.search || '';

    const status =
        req.query.status || '';

    const priority =
        req.query.priority || '';

    const page =
        parseInt(req.query.page) || 1;

    const limit = 10;

    const offset =
        (page - 1) * limit;

    /* =========================================
       CONDITIONS
    ========================================= */

    let conditions = [];
    let values = [];

    if (search) {

        conditions.push(`
            (
                patients.full_name LIKE ?
                OR rooms.room_number LIKE ?
            )
        `);

        values.push(
            `%${search}%`,
            `%${search}%`
        );
    }

    if (status) {

        conditions.push(
            'assignments.status = ?'
        );

        values.push(status);
    }

    if (priority) {

        conditions.push(
            'patients.isolation_priority = ?'
        );

        values.push(priority);
    }

    /* =========================================
       WHERE CLAUSE
    ========================================= */

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

    /* =========================================
       COUNT QUERY
    ========================================= */

    const countSql = `
        SELECT COUNT(*) AS total
        FROM assignments
        JOIN patients
            ON assignments.patient_id = patients.patient_id
        JOIN rooms
            ON assignments.room_id = rooms.room_id
        ${whereClause}
    `;

    db.query(
        countSql,
        values,
        (err, countResult) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            const totalAssignments =
                countResult[0].total;

            const totalPages =
                Math.ceil(
                    totalAssignments / limit
                );

            /* =========================================
               ASSIGNMENT QUERY
            ========================================= */

            const sql = `

                SELECT
                    assignments.assignment_id,
                    assignments.assigned_by,
                    patients.full_name AS patient_name,
                    rooms.room_number,
                    patients.isolation_priority,
                    assignments.status,
                    assignments.assigned_at


                FROM assignments
                JOIN patients
                    ON assignments.patient_id = patients.patient_id
                JOIN rooms
                    ON assignments.room_id = rooms.room_id
                ${whereClause}
                ORDER BY assignments.assigned_at DESC
                LIMIT ?
                OFFSET ?
            `;

            db.query(
                sql,
                [
                    ...values,
                    limit,
                    offset
                ],
                (err, results) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Database Error'
                        );
                    }

                    res.render(
                        'assignments/index',
                        {

                            assignments: results,

                            currentPage:
                                'assignments',

                            search,

                            status,

                            priority,

                            currentPaginationPage:
                                page,

                            totalPages
                        }
                    );
                }
            );
        }
    );
};





const showAddAssignmentForm = (req, res) => {

    const patientQuery =
        'SELECT * FROM patients';




    const roomQuery = `
        SELECT *
        FROM rooms
        WHERE available_beds > 0
    `;



    db.query(patientQuery, (err, patients) => {

        if (err) {

            console.log(err);

            return res.send(
                'Database Error'
            );
        }

        db.query(roomQuery, (err, rooms) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            res.render('assignments/add', {

                patients,
                rooms,

                currentPage: 'assignments',

                
            });
        });
    });
};


const createAssignment = (req, res) => {

    const {
        patient_id,
        room_id
    } = req.body;

    /* =========================================
       CHECK IF PATIENT ALREADY HAS ACTIVE ROOM
    ========================================= */

    const existingAssignmentSql = `
        SELECT *
        FROM assignments
        WHERE patient_id = ?
        AND status = 'Active'
    `;

    db.query(
        existingAssignmentSql,
        [patient_id],
        (err, existingAssignments) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (existingAssignments.length > 0) {

                return res.send(
                    'Patient already has an active room assignment.'
                );
            }

            /* =========================================
               GET ROOM DETAILS
            ========================================= */

            const roomSql = `
                SELECT *
                FROM rooms
                WHERE room_id = ?
            `;

            db.query(
                roomSql,
                [room_id],
                (err, roomResults) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Database Error'
                        );
                    }

                    if (roomResults.length === 0) {

                        return res.send(
                            'Room not found.'
                        );
                    }

                    const room =
                        roomResults[0];

                    /* =========================================
                       CHECK ROOM CAPACITY
                    ========================================= */

                    if (
                        room.current_occupancy >=
                        room.capacity
                    ) {

                        return res.send(
                            'Room is already full.'
                        );
                    }

                    /* =========================================
                       CREATE ASSIGNMENT
                    ========================================= */

                    const insertSql = `
                        INSERT INTO assignments
                        (
                            patient_id,
                            room_id,
                            assigned_by,
                            status
                        )
                        VALUES (?, ?, ?, ?)
                    `;

                    db.query(
                        insertSql,
                        [
                            patient_id,
                            room_id,
                            req.session.user.id,
                            'Active'
                        ],
                        (err) => {

                            if (err) {

                                console.log(err);

                                return res.send(
                                    'Assignment Failed'
                                );
                            }

                            /* =========================================
                               UPDATE ROOM OCCUPANCY
                            ========================================= */

                            const newOccupancy =
                                room.current_occupancy + 1;

                            const availableBeds =
                                room.capacity - newOccupancy;

                            let roomStatus =
                                'Available';

                            if (
                                newOccupancy >= room.capacity
                            ) {

                                roomStatus =
                                    'Occupied';
                            }



                            const updateRoomSql = `
                                UPDATE rooms
                                SET
                                    current_occupancy =
                                        GREATEST(current_occupancy - 1, 0),

                                    available_beds =
                                        LEAST(available_beds + 1, capacity),

                                    availability_status='Available'

                                WHERE room_id=?
                            `;


                            db.query(
                                updateRoomSql,
                                [
                                    newOccupancy,
                                    availableBeds,
                                    roomStatus,
                                    room_id
                                ],
                                (err) => {

                                    if (err) {

                                        console.log(err);

                                        return res.send(
                                            'Room Update Failed'
                                        );
                                    }

                                    /* =========================================
                                       NOTIFICATIONS
                                    ========================================= */

                                    createNotification(

                                        'Patient Assigned',

                                        `A patient was assigned to Room ${room.room_number}.`,

                                        'success',

                                        'hospital_admin'
                                    );

                                    createNotification(

                                        'Isolation Assignment',

                                        `A patient has been assigned to Room ${room.room_number}.`,

                                        'warning',

                                        'staff'
                                    );

                                    /* =========================================
                                       ACTIVITY FEED
                                    ========================================= */

                                    createActivity(

                                        req.session.user.id,

                                        'Patient Assignment',

                                        `Assigned patient to Room ${room.room_number}.`,

                                        'all'
                                    );

                                    res.redirect(
                                        '/assignments'
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};





/* =========================================
   SHOW EDIT ASSIGNMENT FORM
========================================= */

const showEditAssignmentForm = (req, res) => {

    const assignmentId =
        req.params.id;

    const sql = `
        SELECT *
        FROM assignments
        WHERE assignment_id=?
    `;

    db.query(
        sql,
        [assignmentId],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (
                results.length === 0
            ) {

                return res.send(
                    'Assignment Not Found'
                );
            }

            const assignment =
                results[0];

            /* ============================
               OWNERSHIP CHECK
            ============================ */

            if (

                req.session.user.role === 'staff' &&

                assignment.assigned_by !==
                req.session.user.id

            ) {

                return res.status(403).render(
                    'errors/error',
                    {

                        layout:
                            'layouts/dashboard',

                        errorTitle:
                            'Access Denied',

                        errorMessage:
                            'You can only edit your own assignments',

                        currentPage:
                            'assignments'
                    }
                );
            }

            /* ============================
               LOAD DATA
            ============================ */


            db.query(
                'SELECT * FROM patients',
                (err, patients) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Patient Query Failed'
                        );
                    }

                    db.query(
                        'SELECT * FROM rooms',
                        (err, rooms) => {

                            if (err) {

                                console.log(err);

                                return res.send(
                                    'Room Query Failed'
                                );
                            }

                            res.render(
                                'assignments/edit',
                                {

                                    assignment,

                                    patients,

                                    rooms,

                                    currentPage:
                                        'assignments',

                                    layout:
                                        'layouts/dashboard'
                                }
                            );
                        }
                    );
                }
            );

        }
    );
};



/* =========================================
   UPDATE ASSIGNMENT
========================================= */

const updateAssignment = (req, res) => {

    const assignmentId =
        req.params.id;

    const {

        patient_id,
        room_id,
        status

    } = req.body;

    /* =========================================
       GET ASSIGNMENT
    ========================================= */

    const assignmentSql = `
        SELECT *
        FROM assignments
        WHERE assignment_id=?
    `;

    db.query(
        assignmentSql,
        [assignmentId],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (
                results.length === 0
            ) {

                return res.send(
                    'Assignment Not Found'
                );
            }

            const assignment =
                results[0];

            /* =========================================
               OWNERSHIP CHECK
            ========================================= */

            if (

                req.session.user.role === 'staff' &&

                assignment.assigned_by !==
                req.session.user.id

            ) {

                return res.status(403).render(
                    'errors/error',
                    {

                        layout:
                            'layouts/dashboard',

                        errorTitle:
                            'Access Denied',

                        errorMessage:
                            'You can only edit your own assignments',

                        currentPage:
                            'assignments'
                    }
                );
            }

            /* =========================================
               UPDATE
            ========================================= */

            const updateSql = `
                UPDATE assignments
                SET
                    patient_id=?,
                    room_id=?,
                    status=?
                WHERE assignment_id=?
            `;

            db.query(
                updateSql,
                [
                    patient_id,
                    room_id,
                    status,
                    assignmentId
                ],
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Update Failed'
                        );
                    }

                    createNotification(

                        'Assignment Updated',

                        'An assignment was updated.',

                        'info',

                        'hospital_admin'
                    );

                    createActivity(

                        req.session.user.id,

                        'Assignment Updated',

                        'Assignment updated successfully.',

                        'all'
                    );

                    res.redirect(
                        '/assignments'
                    );
                }
            );
        }
    );
};





/* =========================================
   SHOW TRANSFER FORM
========================================= */

const showTransferForm = (req, res) => {

    const assignmentId =
        req.params.id;

    const assignmentSql = `
        SELECT *
        FROM assignments
        WHERE assignment_id = ?
    `;

    const roomSql = `
        SELECT *
        FROM rooms
        WHERE available_beds > 0
    `;

    db.query(
        assignmentSql,
        [assignmentId],
        (err, assignmentResults) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            db.query(
                roomSql,
                (err, roomResults) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Database Error'
                        );
                    }


                    res.render(
                        'assignments/transfer',
                        {
                            assignment:
                                assignmentResults[0],

                            rooms:
                                roomResults,

                            currentPage:
                                'assignments',

                           
                        }
                    );
                }
            );
        }
    );
};

/* =========================================
   TRANSFER PATIENT
========================================= */

const transferAssignment = (req, res) => {


    const assignmentId =
        req.params.id;

    const {
        new_room_id
    } = req.body;

    const assignmentSql = `
        SELECT *
        FROM assignments
        WHERE assignment_id = ?
    `;

    db.query(
        assignmentSql,
        [assignmentId],
        (err, assignmentResults) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }


    if (
        assignmentResults.length === 0
    ) {

        return res.send(
            'Assignment Not Found'
        );
    }


            const assignment =
                assignmentResults[0];

            const oldRoomId =
                assignment.room_id;




            /* =========================================
            PREVENT SAME ROOM TRANSFER
            ========================================= */

            if (
                parseInt(oldRoomId) ===
                parseInt(new_room_id)
            ) {

                return res.send(
                    'Patient is already assigned to this room.'
                );
            }



            /* =========================================
               COMPLETE OLD ASSIGNMENT
            ========================================= */








































            db.query(
                `
                UPDATE assignments
                SET status='Completed'
                WHERE assignment_id=?
                `,
                [assignmentId],
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Transfer Failed'
                        );
                    }

                    /* =========================================
                       FREE OLD ROOM
                    ========================================= */



                    db.query(
                        `
                        UPDATE rooms
                        SET
                            current_occupancy =
                                GREATEST(current_occupancy - 1, 0),

                            available_beds =
                                LEAST(available_beds + 1, capacity),

                            availability_status = 'Available'

                        WHERE room_id = ?
                        `,
                        [oldRoomId],
                        (err) => {

                            if (err) {

                                console.log(err);

                                return res.send(
                                    'Room Update Failed'
                                );
                            }

                            /* =========================================
                            CREATE NEW ASSIGNMENT
                            ========================================= */

                            req.body.patient_id =
                                assignment.patient_id;

                            req.body.room_id =
                                new_room_id;

                            createAssignment(
                                req,
                                res
                            );
                        }
                    );


                }
            );
        }
    );
};

/* =========================================
   DISCHARGE PATIENT
========================================= */

const dischargePatient = (req, res) => {

    const assignmentId =
        req.params.id;

    const sql = `
        SELECT *
        FROM assignments
        WHERE assignment_id = ?
    `;

    db.query(
        sql,
        [assignmentId],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            const assignment =
                results[0];

            /* =========================================
               COMPLETE ASSIGNMENT
            ========================================= */

            db.query(
                `
                UPDATE assignments
                SET status='Completed'
                WHERE assignment_id=?
                `,
                [assignmentId],
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Discharge Failed'
                        );
                    }

                    /* =========================================
                       UPDATE ROOM
                    ========================================= */

                    db.query(
                        `
                        UPDATE rooms
                        SET
                            current_occupancy =
                                GREATEST(current_occupancy - 1, 0),

                            available_beds =
                                LEAST(available_beds + 1, capacity),

                            availability_status = 'Available'

                        WHERE room_id = ?
                        `,
                        [assignment.room_id],
                        (err) => {

                            if (err) {

                                console.log(err);

                                return res.send(
                                    'Room Update Failed'
                                );
                            }

                            createNotification(

                                'Patient Discharged',

                                'A patient has been discharged.',

                                'success',

                                'hospital_admin'
                            );

                            createActivity(

                                req.session.user.id,

                                'Patient Discharge',

                                'Patient discharged successfully.',

                                'all'
                            );

                            res.redirect(
                                '/assignments'
                            );
                        }
                    );

                }
            );
        }
    );
};

const verifyAssignmentOwnership = (

    assignmentId,
    userId,
    callback

) => {

    const sql = `
        SELECT *
        FROM assignments
        WHERE assignment_id=?
        AND assigned_by=?
    `;

    db.query(
        sql,
        [assignmentId, userId],
        (err, results) => {

            if (err) {

                return callback(err);
            }

            callback(
                null,
                results.length > 0
            );
        }
    );
};


module.exports = {

    getAssignments,

    showAddAssignmentForm,

    createAssignment,

    showEditAssignmentForm,

    updateAssignment,

    showTransferForm,

    transferAssignment,

    dischargePatient
};