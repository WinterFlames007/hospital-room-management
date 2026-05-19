const express = require('express');

const router = express.Router();

const db = require('../config/db');

/* =========================================
   DELETE SINGLE NOTIFICATION
========================================= */

router.post(
    '/read/:id',
    (req, res) => {

        const sql = `
            DELETE FROM notifications
            WHERE notification_id = ?
        `;

        db.query(
            sql,
            [req.params.id],
            (err) => {

                if (err) {

                    console.log(err);

                    return res.json({
                        success: false
                    });
                }

                res.json({
                    success: true
                });
            }
        );
    }
);

/* =========================================
   DELETE ALL NOTIFICATIONS
========================================= */

router.post(
    '/read-all',
    (req, res) => {

        const sql = `
            DELETE FROM notifications
            WHERE
                target_role = ?
                OR target_role = 'all'
        `;

        db.query(
            sql,
            [
                req.session.user.role
            ],
            (err) => {

                if (err) {

                    console.log(err);

                    return res.json({
                        success: false
                    });
                }

                res.json({
                    success: true
                });
            }
        );
    }
);

module.exports = router;