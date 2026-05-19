const db = require('../config/db');

const XLSX = require('xlsx');

const exportPatients = (req, res) => {

    const sql =
        'SELECT * FROM patients';

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.send(
                'Database Error'
            );
        }

        const worksheet =
            XLSX.utils.json_to_sheet(results);

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Patients'
        );

        const buffer =
            XLSX.write(workbook, {
                type: 'buffer',
                bookType: 'xlsx'
            });

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=patients-report.xlsx'
        );

        res.type(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.send(buffer);
    });
};

const exportRooms = (req, res) => {

    const sql =
        'SELECT * FROM rooms';

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.send(
                'Database Error'
            );
        }

        const worksheet =
            XLSX.utils.json_to_sheet(results);

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Rooms'
        );

        const buffer =
            XLSX.write(workbook, {
                type: 'buffer',
                bookType: 'xlsx'
            });

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=rooms-report.xlsx'
        );

        res.type(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.send(buffer);
    });
};

const exportAssignments = (req, res) => {

    const sql = `
        SELECT
            assignments.assignment_id,
            patients.full_name,
            rooms.room_number,
            assignments.status,
            assignments.assigned_at
        FROM assignments
        JOIN patients
            ON assignments.patient_id =
            patients.patient_id
        JOIN rooms
            ON assignments.room_id =
            rooms.room_id
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.send(
                'Database Error'
            );
        }

        const worksheet =
            XLSX.utils.json_to_sheet(results);

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Assignments'
        );

        const buffer =
            XLSX.write(workbook, {
                type: 'buffer',
                bookType: 'xlsx'
            });

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=assignments-report.xlsx'
        );

        res.type(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.send(buffer);
    });
};

module.exports = {
    exportPatients,
    exportRooms,
    exportAssignments
};