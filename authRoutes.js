const express = require('express');
const router = express.Router();

const {
    showLogin,
    loginUser,
    logoutUser,
    forgotPassword,
    showResetPassword,
    resetPassword
} = require('../controllers/authController');

router.get('/login', showLogin);

router.post('/login', loginUser);

router.get('/register', (req, res) => {

    res.render('auth/register', {
        layout: 'layouts/auth'
    });
});

router.get('/forgot-password', (req, res) => {

    res.render('auth/forgot-password', {
        layout: 'layouts/auth'
    });
});

router.post(
    '/forgot-password',
    forgotPassword
);

router.get(
    '/reset-password/:token',
    showResetPassword
);

router.post(
    '/reset-password/:token',
    resetPassword
);

router.get('/logout', logoutUser);

module.exports = router;