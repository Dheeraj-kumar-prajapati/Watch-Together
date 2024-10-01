const multer = require('multer');
const path = require('path');
const { currentVideoState } = require('../models/roomModel');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'videos');
    },
    filename: (req, file, cb) => {
        const safeFilename = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, safeFilename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.mp4', '.mkv', '.webm', '.ogg', '.avi'];
    const allowedMimeTypes = [
        'video/mp4',
        'video/x-matroska',
        'video/webm',
        'video/ogg',
        'video/x-msvideo'
    ];

    const fileExt = path.extname(file.originalname).toLowerCase();
    const isExtensionAllowed = allowedExtensions.includes(fileExt);
    const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);

    if (isExtensionAllowed && isMimeTypeAllowed) {
        cb(null, true);
    } else {
        cb(new Error('Only video files with the following formats are allowed: MP4, MKV, WEBM, OGG, AVI.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const uploadVideo = (req, res) => {
    console.log("in");
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    currentVideoState.videoSrc = `/videos/${req.file.filename}`;
    console.log("done")
    return res.status(200).json({ message: 'File uploaded successfully', filePath: `http://localhost:3000/videos/${req.file.filename}` });
};

module.exports = { upload, uploadVideo };
