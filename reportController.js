const db = require('../config/db');

/* =========================================
   GET REPORTS
========================================= */

const getReports = (req, res) => {

    /* =========================================
       ACCESS PROTECTION
    ========================================= */

    if (

        req.session.user.role !== 'admin' &&

        req.session.user.role !== 'hospital_admin'

    ) {

        return res.status(403).render(
            'errors/error',
            {
                layout:
                    'layouts/dashboard',

                errorTitle:
                    'Access Denied',

                errorMessage:
                    'Only administrators can access reports.',

                currentPage: ''
            }
        );
    }

    /* =========================================
       REPORT DATA
    ========================================= */

    const reports = {

        totalPatients: 0,

        occupiedRooms: 0,

        highPriorityCases: 0
    };

    /* =========================================
       TOTAL PATIENTS
    ========================================= */

    db.query(
        'SELECT COUNT(*) AS total FROM patients',
        (err, patientResult) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            reports.totalPatients =
                patientResult[0].total;

            /* =========================================
               OCCUPIED ROOMS
            ========================================= */

            db.query(
                `
                SELECT COUNT(*) AS total
                FROM rooms
                WHERE availability_status='Occupied'
                `,
                (err, roomResult) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Database Error'
                        );
                    }

                    reports.occupiedRooms =
                        roomResult[0].total;

                    /* =========================================
                       HIGH PRIORITY CASES
                    ========================================= */

                    db.query(
                        `
                        SELECT COUNT(*) AS total
                        FROM patients
                        WHERE isolation_priority='High'
                        `,
                        (err, priorityResult) => {

                            if (err) {

                                console.log(err);

                                return res.send(
                                    'Database Error'
                                );
                            }

                            reports.highPriorityCases =
                                priorityResult[0].total;

                            /* =========================================
                               RENDER REPORTS
                            ========================================= */

                            res.render(
                                'reports/index',
                                {

                                    reports,

                                    currentPage:
                                        'reports',

                                    layout:
                                        'layouts/dashboard'
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

module.exports = {

    getReports
};