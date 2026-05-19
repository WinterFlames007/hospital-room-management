const express = require('express');

const router = express.Router();

const upload =
    require('../config/multer');

const {
    requireLogin
} = require('../middleware/authMiddleware');

const {

    getProfile,

    getSettings,

    uploadProfileImage,

    getSecurityPage,

    changePassword,

    changeEmail,

    verifyEmail,

    updateTheme

} = require('../controllers/profileController');

/* =========================================
   PROFILE PAGES
========================================= */

router.get(
    '/',
    requireLogin,
    getProfile
);

router.get(
    '/settings',
    requireLogin,
    getSettings
);

router.get(
    '/security',
    requireLogin,
    getSecurityPage
);

/* =========================================
   ACCOUNT ACTIONS
========================================= */

router.post(
    '/change-password',
    requireLogin,
    changePassword
);

router.post(
    '/change-email',
    requireLogin,
    changeEmail
);

router.post(
    '/theme',
    requireLogin,
    updateTheme
);

/* =========================================
   EMAIL VERIFICATION
========================================= */

router.get(
    '/verify-email/:token',
    verifyEmail
);

/* =========================================
   PROFILE IMAGE
========================================= */

router.post(
    '/upload-image',
    requireLogin,
    upload.single('profile_image'),
    uploadProfileImage
);

module.exports = router;