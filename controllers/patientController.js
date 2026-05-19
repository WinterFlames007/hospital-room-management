const db = require('../config/db');

const createNotification =
    require('../utils/createNotification');

const createActivity =
    require('../utils/createActivity');








const getPatients = (req, res) => {

    /* =========================================
       SEARCH + PAGINATION
    ========================================= */

    const search =
        req.query.search || '';



    const status =
        req.query.status || '';


    const page =
        parseInt(req.query.page) || 1;

    const limit = 10;

    const offset =
        (page - 1) * limit;

    /* =========================================
       SEARCH QUERY
    ========================================= */



    const searchValue =
        `%${search}%`;


    let conditions = `
        (
            full_name LIKE ?
            OR symptoms LIKE ?
            OR infection_risk LIKE ?
            OR isolation_priority LIKE ?
        )
    `;

    const values = [

        searchValue,
        searchValue,
        searchValue,
        searchValue
    ];

    /* =========================================
    STATUS FILTER
    ========================================= */

    if (status) {

        conditions += `
            AND status = ?
        `;

        values.push(status);
    }

    const searchSql = `
        SELECT *
        FROM patients
        WHERE ${conditions}
        ORDER BY created_at DESC
        LIMIT ?
        OFFSET ?
    `;


    /* =========================================
       TOTAL COUNT QUERY
    ========================================= */




    const countSql = `
        SELECT COUNT(*) AS total
        FROM patients
        WHERE ${conditions}
    `;





    db.query(
        countSql,
        values,
        (err, countResult) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            const totalPatients =
                countResult[0].total;

            const totalPages =
                Math.ceil(
                    totalPatients / limit
                );

            /* =========================================
               LOAD PATIENTS
            ========================================= */

            db.query(
                searchSql,

                [
                    ...values,
                    limit,
                    offset
                ],

                (err, results) => {

                    if (err) {

                        console.log(err);

                        return res.send(
                            'Database Error'
                        );
                    }


                    res.render(
                        'patients/index',
                        {
                            patients: results,

                            currentPage:
                                'patients',

                            search,

                            status,

                            currentPaginationPage:
                                page,

                            totalPages
                        }
                    );

                }
            );
        }
    );
};



const showAddPatientForm = (req, res) => {

    res.render('patients/add', {

        currentPage: 'patients'
    });
};

const createPatient = (req, res) => {

    const {

        full_name,
        age,
        symptoms,
        infection_risk,
        isolation_priority,
        status

    } = req.body;

    const sql = `
        INSERT INTO patients
        (
            full_name,
            age,
            symptoms,
            infection_risk,
            isolation_priority,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            full_name,
            age,
            symptoms,
            infection_risk,
            isolation_priority,
            status
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Insert Failed'
                );
            }

            /* =========================================
               NOTIFICATIONS
            ========================================= */

            // HOSPITAL ADMIN

            createNotification(

                'New Patient Added',

                `${full_name} was added to the hospital system.`,

                'success',

                'hospital_admin'
            );

            // ADMIN

            createNotification(

                'Patient Registration',

                `${full_name} was successfully registered.`,

                'info',

                'admin'
            );

            /* =========================================
               ACTIVITIES
            ========================================= */

            createActivity(

                req.session.user.id,

                'Patient Added',

                `${full_name} was added to the hospital system.`,

                'all'
            );

            /* =========================================
               HIGH PRIORITY
            ========================================= */

            if (
                isolation_priority === 'High'
            ) {

                // NOTIFICATION

                createNotification(

                    'High Priority Isolation',

                    `${full_name} requires immediate isolation.`,

                    'danger',

                    'all'
                );

                // ACTIVITY

                createActivity(

                    req.session.user.id,

                    'High Priority Isolation',

                    `${full_name} marked as HIGH isolation priority.`,

                    'all'
                );
            }

            res.redirect('/patients');
        }
    );
};


/* =========================================
   DELETE PATIENT
========================================= */

const deletePatient = (req, res) => {


    if (

        req.session.user.role !== 'admin' &&

        req.session.user.role !== 'hospital_admin'

    ) {

        return res.status(403).render(
            'errors/error',
            {
                message:
                    'Access Denied',
                currentPage: ''
            }
        );
    }


    const patientId =
        req.params.id;




    /* =========================================
    CHECK ACTIVE ASSIGNMENTS
    ========================================= */

    const checkSql = `
        SELECT *
        FROM assignments
        WHERE
            patient_id = ?
            AND status = 'Active'
    `;



db.query(
    checkSql,
    [patientId],
    (err, activeAssignments) => {

        if (err) {

            console.log(err);

            return res.send(
                'Database Error'
            );
        }

        if (activeAssignments.length > 0) {

            return res.send(
                'Patient is currently assigned to a room. Discharge or transfer patient first.'
            );
        }

        /* =========================================
           DELETE PATIENT
        ========================================= */

        const sql = `
            DELETE FROM patients
            WHERE patient_id = ?
        `;

        db.query(
            sql,
            [patientId],
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.send(
                        'Delete Failed'
                    );
                }

                /* =========================================
                   ACTIVITY
                ========================================= */

                createActivity(

                    req.session.user.id,

                    'Patient Deleted',

                    `Patient record ID ${patientId} was deleted.`,

                    'management'
                );



                res.redirect('/patients');
            }
        );
    }
);
};






/* =========================================
   SHOW EDIT PATIENT FORM
========================================= */

const showEditPatientForm = (req, res) => {

    const patientId =
        req.params.id;

    const sql = `
        SELECT *
        FROM patients
        WHERE patient_id = ?
    `;

    db.query(
        sql,
        [patientId],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Database Error'
                );
            }

            if (results.length === 0) {

                return res.send(
                    'Patient Not Found'
                );
            }

            res.render(
                'patients/edit',
                {
                    patient:
                        results[0],

                    currentPage:
                        'patients'
                }
            );
        }
    );
};

/* =========================================
   UPDATE PATIENT
========================================= */

const updatePatient = (req, res) => {

    const patientId =
        req.params.id;

    const {

        full_name,
        age,
        symptoms,
        infection_risk,
        isolation_priority,
        status

    } = req.body;

    const sql = `
        UPDATE patients
        SET
            full_name = ?,
            age = ?,
            symptoms = ?,
            infection_risk = ?,
            isolation_priority = ?,
            status = ?
        WHERE patient_id = ?
    `;

    db.query(
        sql,
        [
            full_name,
            age,
            symptoms,
            infection_risk,
            isolation_priority,
            status,
            patientId
        ],
        (err) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Update Failed'
                );
            }

            createActivity(

                req.session.user.id,

                'Patient Updated',

                `${full_name} patient record was updated.`,

                'all'
            );

            res.redirect('/patients');
        }
    );
};




module.exports = {

    getPatients,

    showAddPatientForm,

    createPatient,

    deletePatient,

    showEditPatientForm,

    updatePatient
};