const db = require('../config/db');

const getAlerts = (req, res) => {

    const sql = `
        SELECT *
        FROM patients
        WHERE isolation_priority = 'High'
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.send(
                'Database Error'
            );
        }

        res.render('alerts/index', {
            alerts: results,
            currentPage: 'alerts'
        });
    });
};

module.exports = {
    getAlerts
};