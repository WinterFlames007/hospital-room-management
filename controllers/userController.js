const db = require('../config/db');

/* =========================================
   GET USERS
========================================= */

const getUsers = (req, res) => {

    /* =========================================
       ADMIN PROTECTION
    ========================================= */

    if (
        req.session.user.role !== 'admin'
    ) {

        return res.status(403).render(
            'errors/error',
            {
                layout:
                    'layouts/dashboard',

                errorTitle:
                    'Admin Access Only',

                errorMessage:
                    'Only administrators can access user management.',

                currentPage: ''
            }
        );
    }

    /* =========================================
       QUERY VALUES
    ========================================= */

    const search =
        req.query.search || '';

    const role =
        req.query.role || '';

    const page =
        parseInt(req.query.page) || 1;

    const limit = 10;

    const offset =
        (page - 1) * limit;

    /* =========================================
       CONDITIONS
    ========================================= */

    let conditions = [];

    let values = [];

    if (search) {

        conditions.push(`

            (
                full_name LIKE ?
                OR email LIKE ?
            )

        `);

        values.push(
            `%${search}%`,
            `%${search}%`
        );
    }

    if (role) {

        conditions.push(
            'role = ?'
        );

        values.push(role);
    }

    /* =========================================
       WHERE CLAUSE
    ========================================= */

    const whereClause =

        conditions.length > 0

            ? `WHERE ${conditions.join(' AND ')}`

            : '';

    /* =========================================
       COUNT QUERY
    ========================================= */

    const countSql = `
        SELECT COUNT(*) AS total
        FROM users
        ${whereClause}
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

            const totalUsers =
                countResult[0].total;

            const totalPages =
                Math.ceil(totalUsers / limit);

            /* =========================================
               USER QUERY
            ========================================= */

            const sql = `
                SELECT *
                FROM users
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ?
                OFFSET ?
            `;

            db.query(
                sql,
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
                        'users/index',
                        {

                            users:
                                results,

                            currentPage:
                                'users',

                            search,

                            role,

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

/* =========================================
   TOGGLE USER STATUS
========================================= */

const toggleUserStatus = (req, res) => {

    const userId =
        req.params.id;

    const sql = `
        UPDATE users
        SET is_active =
            CASE
                WHEN is_active = 1
                THEN 0
                ELSE 1
            END
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [userId],
        (err) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Status Update Failed'
                );
            }

            res.redirect('/users');
        }
    );
};













/* =========================================
   SHOW EDIT USER FORM
========================================= */

const showEditUserForm = (req, res) => {

    const userId =
        req.params.id;

    const sql = `
        SELECT *
        FROM users
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

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

            res.render(
                'users/edit',
                {
                    user:
                        results[0],

                    currentPage:
                        'users'
                }
            );
        }
    );
};

/* =========================================
   UPDATE USER
========================================= */

const updateUser = (req, res) => {

    const userId =
        req.params.id;

    const {

        full_name,
        email,
        role

    } = req.body;

    const sql = `
        UPDATE users
        SET
            full_name = ?,
            email = ?,
            role = ?
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [
            full_name,
            email,
            role,
            userId
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.send(
                    'Update Failed'
                );
            }

            res.redirect('/users');
        }
    );
};


module.exports = {

    getUsers,

    toggleUserStatus,

    showEditUserForm,

    updateUser
};