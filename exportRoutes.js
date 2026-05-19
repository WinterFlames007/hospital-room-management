const express = require('express');

const router = express.Router();

/* =========================================
   ROLE MIDDLEWARE
========================================= */

const {

    requireHospitalAdmin

} = require('../middleware/roleMiddleware');

/* =========================================
   APPLY GLOBAL PROTECTION
========================================= */

router.use(requireHospitalAdmin);

/* =========================================
   CONTROLLERS
========================================= */

const {

    exportPatients,
    exportRooms,
    exportAssignments

} = require('../controllers/exportController');

/* =========================================
   EXPORT ROUTES
========================================= */

router.get(
    '/patients',
    exportPatients
);

router.get(
    '/rooms',
    exportRooms
);

router.get(
    '/assignments',
    exportAssignments
);

module.exports = router;