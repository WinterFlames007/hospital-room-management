const express = require('express');

const router = express.Router();

/* =========================================
   AUTH MIDDLEWARE
========================================= */

const {
    requireLogin
} = require('../middleware/authMiddleware');

/* =========================================
   ROLE MIDDLEWARE
========================================= */

const {

    requireStaff,
    requireHospitalAdmin

} = require('../middleware/roleMiddleware');

/* =========================================
   CONTROLLERS
========================================= */

const {

    getRooms,
    showAddRoomForm,
    createRoom,
    deleteRoom,
    showEditRoomForm,
    updateRoom

} = require('../controllers/roomController');

/* =========================================
   ROOM ROUTES
========================================= */

router.get(
    '/',
    requireLogin,
    requireStaff,
    getRooms
);

router.get(
    '/add',
    requireLogin,
    requireHospitalAdmin,
    showAddRoomForm
);

router.post(
    '/add',
    requireLogin,
    requireHospitalAdmin,
    createRoom
);


router.get(
    '/edit/:id',
    requireLogin,
    requireHospitalAdmin,
    showEditRoomForm
);

router.post(
    '/edit/:id',
    requireLogin,
    requireHospitalAdmin,
    updateRoom
);



router.post(
    '/delete/:id',
    requireLogin,
    requireHospitalAdmin,
    deleteRoom
);

module.exports = router;