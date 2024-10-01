const express = require('express');
const { upload, uploadVideo } = require('../controllers/uploadController');
const router = express.Router();

router.post('/upload', upload.single('video'), uploadVideo);


// losd:700/api/upload/iuplo

module.exports = router;