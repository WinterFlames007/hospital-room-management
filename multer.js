const multer = require('multer');
const path = require('path');

/* =========================================
   STORAGE CONFIGURATION
========================================= */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

/* =========================================
   FILE FILTER
========================================= */

const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    const allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp'
    ];

    const extname =
        path.extname(
            file.originalname
        ).toLowerCase();

    const validExtension =
        allowedExtensions.includes(
            extname
        );

    const validMimeType =
        allowedMimeTypes.includes(
            file.mimetype
        );

    if (
        validExtension &&
        validMimeType
    ) {

        return cb(null, true);
    }

    cb(
        new Error(
            'Only JPG, JPEG, PNG and WEBP images are allowed'
        )
    );
};

/* =========================================
   MULTER INSTANCE
========================================= */

const upload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter
});

module.exports = upload;