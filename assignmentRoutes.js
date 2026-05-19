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

    requireStaff

} = require('../middleware/roleMiddleware');

/* =========================================
   CONTROLLERS
========================================= */

const {

    getAssignments,
    showAddAssignmentForm,
    createAssignment,

    showEditAssignmentForm,
    updateAssignment,

    showTransferForm,
    transferAssignment,

    dischargePatient

} = require('../controllers/assignmentController');

/* =========================================
   ASSIGNMENTS
========================================= */

router.get(
    '/',
    requireLogin,
    requireStaff,
    getAssignments
);

router.get(
    '/add',
    requireLogin,
    requireStaff,
    showAddAssignmentForm
);

router.post(
    '/add',
    requireLogin,
    requireStaff,
    createAssignment
);

/* =========================================
   EDIT ASSIGNMENT
========================================= */

router.get(
    '/edit/:id',
    requireLogin,
    requireStaff,
    showEditAssignmentForm
);

router.post(
    '/edit/:id',
    requireLogin,
    requireStaff,
    updateAssignment
);

/* =========================================
   TRANSFER
========================================= */

router.get(
    '/transfer/:id',
    requireLogin,
    requireStaff,
    showTransferForm
);

router.post(
    '/transfer/:id',
    requireLogin,
    requireStaff,
    transferAssignment
);

/* =========================================
   DISCHARGE
========================================= */

router.post(
    '/discharge/:id',
    requireLogin,
    requireStaff,
    dischargePatient
);

module.exports = router;