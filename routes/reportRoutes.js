const express = require('express');

const router = express.Router();

/* =========================================
   ROLE MIDDLEWARE
========================================= */

const {

    requireHospitalAdmin

} = require('../middleware/roleMiddleware');

/* =========================================
   CONTROLLERS
========================================= */

const {

    getReports

} = require('../controllers/reportController');

/* =========================================
   REPORT ROUTES
========================================= */

router.get(
    '/',
    requireHospitalAdmin,
    getReports
);

module.exports = router;