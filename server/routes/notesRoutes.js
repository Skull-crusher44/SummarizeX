import express from 'express';
import NotesService from '../services/notesService.js';
import { samplePrompts } from '../utils/openAi.js';

const router = express.Router();

// Get notes by video ID
router.get('/:videoId', NotesService.getNotesByVideoId);

// Get sample prompts
router.get('/prompts/samples', (req, res) => {
    res.json(samplePrompts);
});

// Generate notes from transcript
router.post('/generate/:videoId', NotesService.generateNotes);

// Update notes
router.put('/:id', NotesService.updateNotes);

export default router;
