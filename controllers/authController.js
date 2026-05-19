const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const showLogin = (req, res) => {

    res.render('auth/login', {
        layout: 'layouts/auth'
    });
};





const loginUser = (req, res) => {

    const email =
        req.body.email.trim().toLowerCase();

    const password =
        req.body.password;

    const sql =
        'SELECT * FROM users WHERE email=?';

    db.query(sql, [email], async (err, results) => {

        if (err) {

            console.log(err);

            return res.send(
                'Database Error'
            );
        }

        if (results.length === 0) {

            return res.send(
                'User Not Found'
            );
        }

        const user = results[0];


        /* =========================================
        ACCOUNT STATUS CHECK
        ========================================= */

        if (!user.is_active) {

            return res.send(
                'Account Disabled'
            );
        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!passwordMatch) {

            return res.send(
                'Invalid Password'
            );
        }

        /* =========================================
           LOGIN TRACKING
        ========================================= */

        const updateLoginSql = `
            UPDATE users
            SET
                is_online = 1,
                last_login = NOW()
            WHERE user_id = ?
        `;

        db.query(
            updateLoginSql,
            [user.user_id]
        );

        /* =========================================
           SESSION
        ========================================= */

        req.session.user = {

            id: user.user_id,

            name: user.full_name,

            role: user.role,
            
            email: user.email,

            theme:
                user.theme_preference || 'light',


            profile_image:
                user.profile_image
        };

        res.redirect('/');
    });
};
















const forgotPassword = (req, res) => {

    const email =
        req.body.email
            ?.trim()
            .toLowerCase();

    if (!email) {

        return res.send(
            'Email is required'
        );
    }

    const sql =
        'SELECT * FROM users WHERE email=?';

    db.query(sql, [email], (err, results) => {

        if (err) {

            console.log(err);

            return res.send(
                'Database Error'
            );
        }

        if (results.length === 0) {

            return res.send(
                'No account found'
            );
        }

        const token =
            crypto.randomBytes(32)
                .toString('hex');

        const expiry =
            new Date(
                Date.now() + 3600000
            );

        const updateSql = `
            UPDATE users
            SET
                reset_token = ?,
                reset_token_expiry = ?
            WHERE email = ?
        `;

        db.query(
            updateSql,
            [token, expiry, email],
            (err) => {

                if (err) {

                    console.log(err);

                    return res.send(
                        'Database Error'
                    );
                }

                const resetLink =
`https://s2209682n.ncgrp.xyz/reset-password/${token}`;

                console.log(
                    'RESET LINK:',
                    resetLink
                );

                res.send(
                    'Password reset link generated. Check terminal console.'
                );
            }
        );
    });
};

const showResetPassword = (req, res) => {

    res.render(
        'auth/reset-password',
        {
            layout: 'layouts/auth'
        }
    );
};

const resetPassword = async (req, res) => {

    const { token } = req.params;

    const { password } = req.body;

    const sql = `
        SELECT *
        FROM users
        WHERE reset_token = ?
        AND reset_token_expiry > NOW()
    `;

    db.query(
        sql,
        [token],
        async (err, results) => {

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

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const updateSql = `
                UPDATE users
                SET
                    password_hash = ?,
                    reset_token = NULL,
                    reset_token_expiry = NULL
                WHERE reset_token = ?
            `;

            db.query(
                updateSql,
                [hashedPassword, token],
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Database Error'
                        );
                    }

                    res.send(
                        'Password reset successful'
                    );
                }
            );
        }
    );
};



const logoutUser = (req, res) => {

    if (req.session.user) {

        const sql = `
            UPDATE users
            SET is_online = 0
            WHERE user_id = ?
        `;

        db.query(
            sql,
            [req.session.user.id]
        );
    }

    req.session.destroy(() => {

        res.redirect('/login');
    });
};



module.exports = {
    showLogin,
    loginUser,
    logoutUser,
    forgotPassword,
    showResetPassword,
    resetPassword
};