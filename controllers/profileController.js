const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/* =========================================
   PROFILE PAGE
========================================= */

const getProfile = (req, res) => {

    res.render('profile/index', {
        currentPage: 'profile',
        layout: 'layouts/dashboard'
    });
};

/* =========================================
   SETTINGS PAGE
========================================= */

const getSettings = (req, res) => {

    res.render('profile/settings', {
        currentPage: 'settings',
        layout: 'layouts/dashboard'
    });
};

/* =========================================
   SECURITY PAGE
========================================= */

const getSecurityPage = (req, res) => {

    res.render('profile/security', {
        currentPage: 'settings',
        layout: 'layouts/dashboard'
    });
};

/* =========================================
   UPLOAD PROFILE IMAGE
========================================= */

const uploadProfileImage = (req, res) => {

    if (!req.file) {

        return res.send(
            'No image uploaded'
        );
    }

    const imagePath =
        '/uploads/' + req.file.filename;

    const userId =
        req.session.user.id;

    const sql = `
        UPDATE users
        SET profile_image = ?
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [imagePath, userId],
        (err) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            // UPDATE SESSION IMAGE

            req.session.user.profile_image =
                imagePath;

            res.redirect('/profile');
        }
    );
};

/* =========================================
   CHANGE PASSWORD
========================================= */

const changePassword = async (req, res) => {

    const {
        current_password,
        new_password
    } = req.body;

    const userId =
        req.session.user.id;

    const sql =
        'SELECT * FROM users WHERE user_id=?';

    db.query(
        sql,
        [userId],
        async (err, results) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (results.length === 0) {

                return res.send(
                    'User not found'
                );
            }

            const user = results[0];

            const passwordMatch =
                await bcrypt.compare(
                    current_password,
                    user.password_hash
                );

            if (!passwordMatch) {

                return res.send(
                    'Current password incorrect'
                );
            }

            const hashedPassword =
                await bcrypt.hash(
                    new_password,
                    10
                );

            const updateSql = `
                UPDATE users
                SET password_hash=?
                WHERE user_id=?
            `;

            db.query(
                updateSql,
                [hashedPassword, userId],
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Database Error'
                        );
                    }

                    res.send(
                        'Password updated successfully'
                    );
                }
            );
        }
    );
};

/* =========================================
   CHANGE EMAIL
========================================= */

const changeEmail = (req, res) => {

    const newEmail =
        req.body.new_email
            ?.trim()
            .toLowerCase();

    const token =
        crypto.randomBytes(32)
            .toString('hex');

    const expiry =
        new Date(
            Date.now() + (3 * 60 * 60 * 1000)
        );

    const sql = `
        UPDATE users
        SET
            pending_email=?,
            email_verification_token=?,
            email_verification_expiry=?
        WHERE user_id=?
    `;

    db.query(
        sql,
        [
            newEmail,
            token,
            expiry,
            req.session.user.id
        ],
        (err) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }


            const baseUrl =
                process.env.BASE_URL || 'http://localhost:3040';

            const verifyLink =
            `${baseUrl}/profile/verify-email/${token}`;


            console.log(
                'VERIFY EMAIL LINK:',
                verifyLink
            );

            res.send(
                'Verification link generated. Check terminal.'
            );
        }
    );
};

/* =========================================
   VERIFY EMAIL
========================================= */

const verifyEmail = (req, res) => {

    const { token } = req.params;

    const sql = `
        SELECT *
        FROM users
        WHERE
            email_verification_token=?
        AND
            email_verification_expiry > NOW()
    `;

    db.query(
        sql,
        [token],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (results.length === 0) {

                return res.send(
                    'Invalid or expired token'
                );
            }

            const user = results[0];

            const updateSql = `
                UPDATE users
                SET
                    email = pending_email,
                    pending_email = NULL,
                    email_verification_token = NULL,
                    email_verification_expiry = NULL
                WHERE user_id=?
            `;

            db.query(
                updateSql,
                [user.user_id],
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Database Error'
                        );
                    }

                    res.send(
                        'Email updated successfully'
                    );
                }
            );
        }
    );
};


const updateTheme = (req, res) => {

    const theme =
        req.body.theme;

    const sql = `
        UPDATE users
        SET theme_preference = ?
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [
            theme,
            req.session.user.id
        ],
        (err) => {

            if (err) {

                console.log(err);

                return res.json({
                    success: false
                });
            }

            req.session.user.theme =
                theme;

            res.json({
                success: true
            });
        }
    );
};


/* =========================================
   EXPORTS
========================================= */

module.exports = {
    getProfile,
    getSettings,
    getSecurityPage,
    uploadProfileImage,
    changePassword,
    changeEmail,
    verifyEmail,
    updateTheme
};