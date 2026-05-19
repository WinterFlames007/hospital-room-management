const db = require('../config/db');

const createNotification = (

    title,
    message,
    type = 'info',
    roleTarget = 'all'

) => {

    /* =========================================
       PREVENT DUPLICATE RECENT NOTIFICATIONS
    ========================================= */

    const duplicateCheckSql = `
        SELECT *
        FROM notifications
        WHERE title = ?
        AND message = ?
        AND target_role = ?
        AND created_at >= NOW() - INTERVAL 10 SECOND
    `;

    db.query(
        duplicateCheckSql,
        [
            title,
            message,
            roleTarget
        ],
        (err, results) => {

            if (err) {

                console.log(err);

                return;
            }

            /* =========================================
               STOP DUPLICATES
            ========================================= */

            if (results.length > 0) {

                return;
            }

            /* =========================================
               INSERT NOTIFICATION
            ========================================= */

            const sql = `
                INSERT INTO notifications
                (
                    title,
                    message,
                    type,
                    target_role
                )
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    title,
                    message,
                    type,
                    roleTarget
                ],
                (err) => {

                    if (err) {

                        console.log(err);
                    }
                }
            );
        }
    );
};

module.exports = createNotification;