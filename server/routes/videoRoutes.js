import express from 'express';
import VideoService from '../services/videoService.js';
import multer from 'multer';
import { upload } from '../config/multerConfig.js';

const router = express.Router();

// Error handling middleware for file uploads
const handleFileUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 100MB.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

router.get('/', async function (req, res) { 
try {
    const allvideos = await VideoService.getAllVideos();
    res.json({
        allvideos
    })
} catch (error) {
    res.json({
        msg: "error in finding all videos",
        message: error.message
    })
}
})
// Upload video with error handling
router.post('/upload', upload.single('video'), handleFileUploadError, async (req, res, next) => {
    try {
        await VideoService.validateVideoRequest(req);
        const result = await VideoService.uploadVideo(req, res);
        res.json(result);
    }catch (error) {
        next(error);
    }
});

// Get video by ID
router.get('/:id', async (req, res, next) => {
    try {
        const video = await VideoService.getVideoById(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json(video);
    } catch (error) {
        next(error);
    }
});

// Process video
router.post('/process/:id', async (req, res, next) => {
    try {
        const result = await VideoService.processVideo(req.params.id);
        console.log(result);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete video
router.delete('/:id', async (req, res, next) => {
    try {
        await VideoService.cleanup(req.params.id);
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
