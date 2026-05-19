const express = require('express');

const router = express.Router();

/* =========================================
   ROLE MIDDLEWARE
========================================= */

const {

    requireAdmin

} = require('../middleware/roleMiddleware');

/* =========================================
   APPLY ADMIN PROTECTION
========================================= */

router.use(requireAdmin);

/* =========================================
   CONTROLLERS
========================================= */

const {

    getUsers,
    toggleUserStatus,
    showEditUserForm,
    updateUser

} = require('../controllers/userController');
/* =========================================
   USER ROUTES
========================================= */

router.get(
    '/',
    getUsers
);


router.get(
    '/edit/:id',
    showEditUserForm
);

router.post(
    '/edit/:id',
    updateUser
);


router.post(
    '/toggle-status/:id',
    toggleUserStatus
);

module.exports = router;