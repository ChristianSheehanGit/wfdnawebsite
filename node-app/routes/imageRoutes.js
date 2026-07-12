const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');

// Multer in-memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), imageController.uploadImage);
router.delete('/:filename', imageController.deleteImage);

module.exports = router;