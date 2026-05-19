const db = require('../config/db');

const createNotification =
    require('../utils/createNotification');

const createActivity =
    require('../utils/createActivity');





const getRooms = (req, res) => {

    /* =========================================
       QUERY VALUES
    ========================================= */

    const search =
        req.query.search || '';

    const roomType =
        req.query.room_type || '';

    const availability =
        req.query.availability_status || '';

    const page =
        parseInt(req.query.page) || 1;

    const limit = 10;

    const offset =
        (page - 1) * limit;

    /* =========================================
       BASE CONDITIONS
    ========================================= */

    let conditions = [];
    let values = [];

    if (search) {

        conditions.push(
            'room_number LIKE ?'
        );

        values.push(
            `%${search}%`
        );
    }

    if (roomType) {

        conditions.push(
            'room_type = ?'
        );

        values.push(roomType);
    }

    if (availability) {

        conditions.push(
            'availability_status = ?'
        );

        values.push(availability);
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
        FROM rooms
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

            const totalRooms =
                countResult[0].total;

            const totalPages =
                Math.ceil(totalRooms / limit);

            /* =========================================
               ROOM QUERY
            ========================================= */

            const roomSql = `
                SELECT *
                FROM rooms
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ?
                OFFSET ?
            `;

            db.query(
                roomSql,
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
                        'rooms/index',
                        {
                            rooms: results,

                            currentPage:
                                'rooms',

                            search,

                            roomType,

                            availability,

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




const showAddRoomForm = (req, res) => {

    res.render('rooms/add', {

        currentPage: 'rooms'
    });
};



const createRoom = (req, res) => {


    if (

        req.session.user.role !== 'admin' &&

        req.session.user.role !== 'hospital_admin'

    ) {

        return res.status(403).render(
            'errors/error',
            {
                message:
                    'Access Denied',
                currentPage: ''
            }
        );
    }



    const room_number =
        req.body.room_number
            .trim()
            .toUpperCase();

    const {

        room_type,
        availability_status,
        capacity

    } = req.body;

    // INITIAL VALUES

    const current_occupancy = 0;

    const available_beds =
        parseInt(capacity);

    /* =========================================
       CHECK DUPLICATE ROOM
    ========================================= */

    const checkRoomSql = `
        SELECT *
        FROM rooms
        WHERE LOWER(room_number) = LOWER(?)
    `;

    db.query(
        checkRoomSql,
        [room_number],
        (err, existingRooms) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (existingRooms.length > 0) {

                return res.send(
                    'Room number already exists.'
                );
            }

            /* =========================================
               INSERT ROOM
            ========================================= */

            const sql = `
                INSERT INTO rooms
                (
                    room_number,
                    room_type,
                    availability_status,
                    capacity,
                    current_occupancy,
                    available_beds
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    room_number,
                    room_type,
                    availability_status,
                    capacity,
                    current_occupancy,
                    available_beds
                ],
                (err, result) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Insert Failed'
                        );
                    }

                    /* =========================================
                       NOTIFICATIONS
                    ========================================= */

                    createNotification(

                        'New Room Created',

                        `Room ${room_number} was added.`,

                        'success',

                        'hospital_admin'
                    );

                    createNotification(

                        'Room Management Update',

                        `New ${room_type} room created.`,

                        'info',

                        'admin'
                    );

                    /* =========================================
                       ACTIVITIES
                    ========================================= */

                    createActivity(

                        req.session.user.id,

                        'Room Created',

                        `Room ${room_number} was created.`,

                        'all'
                    );

                    res.redirect('/rooms');
                }
            );
        }
    );
};





/* =========================================
   DELETE ROOM
========================================= */

const deleteRoom = (req, res) => {

    if (

        req.session.user.role !== 'admin' &&

        req.session.user.role !== 'hospital_admin'

    ) {

        return res.status(403).render(
            'errors/error',
            {
                layout:
                    'layouts/dashboard',

                errorTitle:
                    'Access Denied',

                errorMessage:
                    'You do not have permission to delete rooms.',

                currentPage: ''
            }
        );
    }

    const roomId =
        req.params.id;

    /* =========================================
       CHECK ACTIVE ASSIGNMENTS
    ========================================= */

    const checkSql = `
        SELECT *
        FROM assignments
        WHERE
            room_id = ?
            AND status = 'Active'
    `;

    db.query(
        checkSql,
        [roomId],
        (err, activeAssignments) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            /* =========================================
               ROOM STILL OCCUPIED
            ========================================= */

            if (activeAssignments.length > 0) {

                return res.send(
                    'Room currently has admitted patients. Transfer or discharge patients first.'
                );
            }

            /* =========================================
               DELETE ROOM
            ========================================= */

            const sql = `
                DELETE FROM rooms
                WHERE room_id = ?
            `;

            db.query(
                sql,
                [roomId],
                (err, result) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Delete Failed'
                        );
                    }

                    /* =========================================
                       ACTIVITY
                    ========================================= */

                    createActivity(

                        req.session.user.id,

                        'Room Deleted',

                        `Room ID ${roomId} was deleted.`,

                        'all'
                    );

                    res.redirect('/rooms');
                }
            );
        }
    );
};




/* =========================================
   SHOW EDIT ROOM FORM
========================================= */

const showEditRoomForm = (req, res) => {

    if (

        req.session.user.role !== 'admin' &&

        req.session.user.role !== 'hospital_admin'

    ) {

        return res.status(403).render(
            'errors/error',
            {
                layout:
                    'layouts/dashboard',

                errorTitle:
                    'Access Denied',

                errorMessage:
                    'Only administrators can edit rooms.',

                currentPage: ''
            }
        );
    }

    const roomId =
        req.params.id;

    const sql = `
        SELECT *
        FROM rooms
        WHERE room_id = ?
    `;

    db.query(
        sql,
        [roomId],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (results.length === 0) {

                return res.send(
                    'Room Not Found'
                );
            }

            res.render(
                'rooms/edit',
                {
                    room:
                        results[0],

                    currentPage:
                        'rooms'
                }
            );
        }
    );
};

/* =========================================
   UPDATE ROOM
========================================= */

const updateRoom = (req, res) => {

    if (

        req.session.user.role !== 'admin' &&

        req.session.user.role !== 'hospital_admin'

    ) {

        return res.status(403).render(
            'errors/error',
            {
                layout:
                    'layouts/dashboard',

                errorTitle:
                    'Access Denied',

                errorMessage:
                    'Only administrators can edit rooms.',

                currentPage: ''
            }
        );
    }

    const roomId =
        req.params.id;

    const room_number =
        req.body.room_number
            .trim()
            .toUpperCase();

    const {

        room_type,
        availability_status,
        capacity

    } = req.body;

    /* =========================================
       CHECK DUPLICATE ROOM
    ========================================= */

    const checkSql = `
        SELECT *
        FROM rooms
        WHERE
            LOWER(room_number) = LOWER(?)
            AND room_id != ?
    `;

    db.query(
        checkSql,
        [
            room_number,
            roomId
        ],
        (err, existingRooms) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (existingRooms.length > 0) {

                return res.send(
                    'Room number already exists.'
                );
            }

            /* =========================================
               UPDATE ROOM
            ========================================= */

            const sql = `
                UPDATE rooms
                SET
                    room_number = ?,
                    room_type = ?,
                    availability_status = ?,
                    capacity = ?
                WHERE room_id = ?
            `;

            db.query(
                sql,
                [
                    room_number,
                    room_type,
                    availability_status,
                    capacity,
                    roomId
                ],
                (err, result) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Update Failed'
                        );
                    }

                    /* =========================================
                       ACTIVITY
                    ========================================= */

                    createActivity(

                        req.session.user.id,

                        'Room Updated',

                        `Room ${room_number} was updated.`,

                        'all'
                    );

                    res.redirect('/rooms');
                }
            );
        }
    );
};



module.exports = {

    getRooms,

    showAddRoomForm,

    createRoom,

    deleteRoom,

    showEditRoomForm,

    updateRoom
};