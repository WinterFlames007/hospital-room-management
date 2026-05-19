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

    getPatients,
    showAddPatientForm,
    createPatient,
    deletePatient,
    showEditPatientForm,
    updatePatient

} = require('../controllers/patientController');



/* =========================================
   PATIENT ROUTES
========================================= */

router.get(
    '/',
    requireLogin,
    requireStaff,
    getPatients
);

router.get(
    '/add',
    requireLogin,
    requireStaff,
    showAddPatientForm
);

router.post(
    '/add',
    requireLogin,
    requireStaff,
    createPatient
);


router.get(
    '/edit/:id',
    requireLogin,
    requireStaff,
    showEditPatientForm
);

router.post(
    '/edit/:id',
    requireLogin,
    requireStaff,
    updatePatient
);

router.post(
    '/delete/:id',
    requireLogin,
    requireHospitalAdmin,
    deletePatient
);

module.exports = router;