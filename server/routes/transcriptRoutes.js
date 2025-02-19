import express from 'express';
import TranscriptService from '../services/transcriptService.js';

const router = express.Router();

// Get transcript by video ID
router.get('/:videoId', TranscriptService.getTranscriptByVideoId);

// Generate transcript
router.post('/generate/:videoId', TranscriptService.generateTranscript);

// Update transcript
router.put('/:id', TranscriptService.updateTranscript);

export default router;
