/* =========================================
   ADMIN ONLY
========================================= */

const requireAdmin = (req, res, next) => {

    if (
        req.session.user &&
        req.session.user.role === 'admin'
    ) {

        return next();
    }

    return res.status(403).render(
        'errors/error',
        {
            layout: 'layouts/auth',

            errorTitle:
                'Access Denied',

            errorMessage:
                'You do not have permission to access this page.'
        }
    );
};

/* =========================================
   HOSPITAL ADMIN
========================================= */

const requireHospitalAdmin = (req, res, next) => {

    if (
        req.session.user &&
        (
            req.session.user.role === 'hospital_admin' ||
            req.session.user.role === 'admin'
        )
    ) {

        return next();
    }

    return res.status(403).render(
        'errors/error',
        {
            layout: 'layouts/auth',

            errorTitle:
                'Access Denied',

            errorMessage:
                'Only hospital administrators can perform this action.'
        }
    );
};

/* =========================================
   STAFF ACCESS
========================================= */

const requireStaff = (req, res, next) => {

    if (
        req.session.user &&
        (
            req.session.user.role === 'staff' ||
            req.session.user.role === 'hospital_admin' ||
            req.session.user.role === 'admin'
        )
    ) {

        return next();
    }

    return res.status(403).render(
        'errors/error',
        {
            layout: 'layouts/auth',

            errorTitle:
                'Access Denied',

            errorMessage:
                'You do not have staff access permissions.'
        }
    );
};

module.exports = {

    requireAdmin,

    requireHospitalAdmin,

    requireStaff
};