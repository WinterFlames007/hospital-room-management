const db = require('../config/db');

const createActivity = (

    userId,
    activityType,
    description,
    roleTarget = 'all'

) => {

    const sql = `
        INSERT INTO activity_logs
        (
            user_id,
            activity_type,
            description,
            role_target
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            activityType,
            description,
            roleTarget
        ],
        (err) => {

            if (err) {

                console.log(err);
            }
        }
    );
};

module.exports = createActivity;