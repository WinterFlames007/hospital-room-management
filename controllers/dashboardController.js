const db = require('../config/db');

const getDashboard = (req, res) => {

    const dashboardData = {};

    /* =========================================
       TOTAL PATIENTS
    ========================================= */

    db.query(
        `
        SELECT COUNT(*) AS totalPatients
        FROM patients
        `,
        (err, patientResult) => {

            if (err) {

                console.log(err);

                return res.send('Database Patient Error '  + err.message);
            }

            dashboardData.totalPatients =
                patientResult[0].totalPatients;

            /* =========================================
               TOTAL ROOMS
            ========================================= */

            db.query(
                `
                SELECT COUNT(*) AS totalRooms
                FROM rooms
                `,
                (err, totalRoomResult) => {

                    if (err) {

                        console.log(err);

                        return res.send('Database Room Error' + err.message);
                    }

                    dashboardData.totalRooms =
                        totalRoomResult[0].totalRooms;

                    /* =========================================
                       ACTIVE STAFF
                    ========================================= */

                    db.query(
                        `
                        SELECT COUNT(*) AS activeStaff
                        FROM users
                        WHERE is_online = 1
                        `,
                        (err, activeStaffResult) => {

                            if (err) {

                                console.log(err);

                                return res.send(
                                    'Database Active Staff Error' + err.message
                                );
                            }

                            dashboardData.activeStaff =
                                activeStaffResult[0].activeStaff;

                            /* =========================================
                               AVAILABLE ROOMS
                            ========================================= */

                            db.query(
                                `
                                SELECT COUNT(*) AS availableRooms
                                FROM rooms
                                WHERE availability_status = 'Available'
                                `,
                                (err, roomResult) => {

                                    if (err) {

                                        console.log(err);

                                        return res.send('Database Available Room Error' + err.message);
                                    }

                                    dashboardData.availableRooms =
                                        roomResult[0].availableRooms;

                                    /* =========================================
                                       OCCUPIED ROOMS
                                    ========================================= */

                                    db.query(
                                        `
                                        SELECT COUNT(*) AS occupiedRooms
                                        FROM rooms
                                        WHERE availability_status = 'Occupied'
                                        `,
                                        (err, occupiedResult) => {

                                            if (err) {

                                                console.log(err);

                                                return res.send('Database Occupied Room Error' + err.message);
                                            }

                                            dashboardData.occupiedRooms =
                                                occupiedResult[0].occupiedRooms;

                                            /* =========================================
                                               MAINTENANCE ROOMS
                                            ========================================= */

                                            db.query(
                                                `
                                                SELECT COUNT(*) AS maintenanceRooms
                                                FROM rooms
                                                WHERE availability_status = 'Maintenance'
                                                `,
                                                (err, maintenanceResult) => {

                                                    if (err) {

                                                        console.log(err);

                                                        return res.send('Database Maintenance Error' + err.message);
                                                    }

                                                    dashboardData.maintenanceRooms =
                                                        maintenanceResult[0].maintenanceRooms;

                                                    /* =========================================
                                                       HIGH PRIORITY CASES
                                                    ========================================= */

                                                    db.query(
                                                        `
                                                        SELECT COUNT(*) AS highPriorityCases
                                                        FROM patients
                                                        WHERE isolation_priority = 'High'
                                                        `,
                                                        (err, priorityResult) => {

                                                            if (err) {

                                                                console.log(err);

                                                                return res.send('Database Priotiry Error'  + err.message);
                                                            }

                                                            dashboardData.highPriorityCases =
                                                                priorityResult[0].highPriorityCases;

                                                            /* =========================================
                                                               PRIORITY COUNTS
                                                            ========================================= */

                                                            db.query(
                                                                `
                                                                SELECT
                                                                    isolation_priority,
                                                                    COUNT(*) AS total
                                                                FROM patients
                                                                GROUP BY isolation_priority
                                                                `,
                                                                (err, priorityChartResults) => {

                                                                    if (err) {

                                                                        console.log(err);

                                                                        return res.send('Database Isolation Error'  + err.message);
                                                                    }

                                                                    let lowCount = 0;
                                                                    let mediumCount = 0;
                                                                    let highCount = 0;

                                                                    priorityChartResults.forEach(item => {

                                                                        if (
                                                                            item.isolation_priority === 'Low'
                                                                        ) {

                                                                            lowCount = item.total;
                                                                        }

                                                                        if (
                                                                            item.isolation_priority === 'Medium'
                                                                        ) {

                                                                            mediumCount = item.total;
                                                                        }

                                                                        if (
                                                                            item.isolation_priority === 'High'
                                                                        ) {

                                                                            highCount = item.total;
                                                                        }
                                                                    });

                                                                    dashboardData.lowPriorityCount =
                                                                        lowCount;

                                                                    dashboardData.mediumPriorityCount =
                                                                        mediumCount;

                                                                    dashboardData.highPriorityCount =
                                                                        highCount;

                                                                    /* =========================================
                                                                       ACTIVE ASSIGNMENTS
                                                                    ========================================= */

                                                                    db.query(
                                                                        `
                                                                        SELECT COUNT(*) AS activeAssignments
                                                                        FROM assignments
                                                                        WHERE status = 'Active'
                                                                        `,
                                                                        (err, activeAssignmentResult) => {

                                                                            if (err) {

                                                                                console.log(err);

                                                                                return res.send('Database Active Assignment Error' + err.message);
                                                                            }

                                                                            dashboardData.activeAssignments =
                                                                                activeAssignmentResult[0].activeAssignments;

                                                                            /* =========================================
                                                                               COMPLETED ASSIGNMENTS
                                                                            ========================================= */

                                                                            db.query(
                                                                                `
                                                                                SELECT COUNT(*) AS completedAssignments
                                                                                FROM assignments
                                                                                WHERE status = 'Completed'
                                                                                `,
                                                                                (err, completedAssignmentResult) => {

                                                                                    if (err) {

                                                                                        console.log(err);

                                                                                        return res.send('Database Complete Assignment Error' + err.message);
                                                                                    }

                                                                                    dashboardData.completedAssignments =
                                                                                        completedAssignmentResult[0].completedAssignments;

                                                                                    /* =========================================
                                                                                       OCCUPANCY RATE
                                                                                    ========================================= */

                                                                                    dashboardData.occupancyRate =

                                                                                        dashboardData.totalRooms > 0

                                                                                            ? Math.round(
                                                                                                (
                                                                                                    dashboardData.occupiedRooms /
                                                                                                    dashboardData.totalRooms
                                                                                                ) * 100
                                                                                            )

                                                                                            : 0;

                                                                                    /* =========================================
                                                                                       RECENT ASSIGNMENTS
                                                                                    ========================================= */

                                                                                    const assignmentQuery = `
                                                                                        SELECT
                                                                                            assignments.assignment_id,
                                                                                            patients.full_name AS patient_name,
                                                                                            rooms.room_number,
                                                                                            patients.isolation_priority,
                                                                                            assignments.status,
                                                                                            assignments.assigned_at
                                                                                        FROM assignments
                                                                                        JOIN patients
                                                                                            ON assignments.patient_id = patients.patient_id
                                                                                        JOIN rooms
                                                                                            ON assignments.room_id = rooms.room_id
                                                                                        ORDER BY assignments.assigned_at DESC
                                                                                        LIMIT 5
                                                                                    `;

                                                                                    db.query(
                                                                                        assignmentQuery,
                                                                                        (err, assignmentResult) => {

                                                                                            if (err) {

                                                                                                console.log(err);

                                                                                                return res.send('Database Assignemnt Query Error' + err.message);
                                                                                            }

                                                                                            dashboardData.assignments =
                                                                                                assignmentResult;

                                                                                            /* =========================================
                                                                                               ACTIVITY FEED
                                                                                            ========================================= */

                                                                                            let activityCondition = `
                                                                                                role_target = 'all'
                                                                                            `;


                                                                                            if (
                                                                                                req.session.user.role === 'hospital_admin'
                                                                                            ) {

                                                                                                activityCondition += `
                                                                                                    OR role_target = 'hospital_admin'
                                                                                                `;
                                                                                            }

                                                                                            if (
                                                                                                req.session.user.role === 'admin'
                                                                                            ) {

                                                                                                activityCondition += `
                                                                                                    OR role_target = 'admin'
                                                                                                    OR role_target = 'hospital_admin'
                                                                                                    OR role_target = 'staff'
                                                                                                `;
                                                                                            }

                                                                                            const activitySql = `
                                                                                                SELECT
                                                                                                    activity_logs.*,
                                                                                                    users.full_name
                                                                                                FROM activity_logs
                                                                                                LEFT JOIN users
                                                                                                    ON activity_logs.user_id = users.user_id
                                                                                                WHERE
                                                                                                    ${activityCondition}
                                                                                                ORDER BY created_at DESC
                                                                                                LIMIT 5
                                                                                            `;

                                                                                            db.query(
                                                                                                activitySql,
                                                                                                (err, activityResults) => {

                                                                                                    if (err) {

                                                                                                        console.log(err);

                                                                                                        activityResults = [];
                                                                                                    }

                                                                                                    /* =========================================
                                                                                                       NOTIFICATIONS
                                                                                                    ========================================= */

                                                                                                    const notificationSql = `
                                                                                                        SELECT *
                                                                                                        FROM notifications
                                                                                                        WHERE
                                                                                                            target_role = ?
                                                                                                            OR target_role = 'all'
                                                                                                        ORDER BY created_at DESC
                                                                                                        LIMIT 10
                                                                                                    `;

                                                                                                    db.query(
                                                                                                        notificationSql,
                                                                                                        [
                                                                                                            req.session.user?.role || 'all'
                                                                                                        ],
                                                                                                        (err, notificationResults) => {

                                                                                                            if (err) {

                                                                                                                console.log(err);

                                                                                                                return res.send(
                                                                                                                    'Notification Error' + err.message
                                                                                                                );
                                                                                                            }

                                                                                                            dashboardData.notifications =
                                                                                                                notificationResults;

                                                                                                            dashboardData.unreadNotifications =
                                                                                                                notificationResults.filter(
                                                                                                                    notification =>
                                                                                                                        notification.is_read === 0
                                                                                                                ).length;

                                                                                                            res.render(
                                                                                                                'dashboard/index',
                                                                                                                {
                                                                                                                    ...dashboardData,

                                                                                                                    activities:
                                                                                                                        activityResults,

                                                                                                                    currentPage:
                                                                                                                        'dashboard',

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
                                                                                }
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
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
    getDashboard
};