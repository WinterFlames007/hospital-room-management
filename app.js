require('./config/db');
const db = require('./config/db');
const liveRoutes =
    require('./routes/liveRoutes');

const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const notificationRoutes =
    require('./routes/notificationRoutes');




const app = express();

/* =========================================
   MIDDLEWARE
========================================= */

const {
    requireLogin
} = require('./middleware/authMiddleware');

/* =========================================
   CONTROLLERS
========================================= */

const {
    
    getDashboard
} = require('./controllers/dashboardController');

/* =========================================
   ROUTES
========================================= */

const authRoutes =
    require('./routes/authRoutes');

const patientRoutes =
    require('./routes/patientRoutes');

const roomRoutes =
    require('./routes/roomRoutes');

const assignmentRoutes =
    require('./routes/assignmentRoutes');

const userRoutes =
    require('./routes/userRoutes');

const profileRoutes =
    require('./routes/profileRoutes');

const reportRoutes =
    require('./routes/reportRoutes');


const exportRoutes =
    require('./routes/exportRoutes');


/* =========================================
   VIEW ENGINE
========================================= */

app.set('view engine', 'ejs');

app.set(
    'layout',
    'layouts/dashboard'
);

app.use(expressLayouts);
app.use('/live', liveRoutes);
/* =========================================
   BODY PARSER
========================================= */

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

/* =========================================
   SESSION
========================================= */

app.use(session({

    secret: 'hospital_secret_key',

    resave: false,

    saveUninitialized: false
}));

/* =========================================
   GLOBAL SESSION USER
========================================= */

app.use((req, res, next) => {

    res.locals.sessionUser =
        req.session.user || null;

    if (!req.session.user) {

        res.locals.notifications = [];

        return next();
    }

    const userRole =
        req.session.user.role;

    const sql = `
        SELECT *
        FROM notifications
        WHERE
            target_role = 'all'
            OR target_role = ?
        ORDER BY created_at DESC
        LIMIT 10
    `;

    db.query(
        sql,
        [userRole],
        (err, results) => {

            if (err) {

                console.log(err);

                res.locals.notifications = [];

                return next();
            }

            res.locals.notifications =
                results;

            next();
        }
    );
});










/* =========================================
   STATIC FILES
========================================= */

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

/* =========================================
   UPLOADS
========================================= */

app.use(
    '/uploads',
    express.static(
        path.join(__dirname, 'uploads')
    )
);

/* =========================================
   ROUTES
========================================= */

app.use('/export', exportRoutes);

app.use('/patients', patientRoutes);

app.use('/rooms', roomRoutes);

app.use('/assignments', assignmentRoutes);

app.use('/users', userRoutes);

app.use('/profile', profileRoutes);

app.use('/reports', reportRoutes);


app.use(
    '/notifications',
    notificationRoutes
);

app.use('/', authRoutes);

/* =========================================
   DASHBOARD
========================================= */

app.get(
    '/',
    requireLogin,
    getDashboard
);

/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use((err, req, res, next) => {

    console.error(err.stack);

    // FILE TYPE ERRORS

    if (
        err.message &&
        err.message.includes('Only')
    ) {

        return res.status(400).render(
            'errors/error',
            {
                layout: 'layouts/auth',

                errorTitle:
                    'Upload Error',

                errorMessage:
                    err.message
            }
        );
    }

    // GENERAL ERRORS

    res.status(500).render(
        'errors/error',
        {
            layout: 'layouts/auth',

            errorTitle:
                'Server Error',

            errorMessage:
                'Something went wrong. Please try again later.'
        }
    );
});

/* =========================================
   SERVER
========================================= */



/* =========================================
   PROCESS ERROR HANDLING
========================================= */

process.on('uncaughtException', (err) => {

    console.error(
        'UNCAUGHT EXCEPTION:',
        err
    );

});

process.on('unhandledRejection', (err) => {

    console.error(
        'UNHANDLED REJECTION:',
        err
    );

});

/* =========================================
   SERVER
========================================= */

module.exports = app;