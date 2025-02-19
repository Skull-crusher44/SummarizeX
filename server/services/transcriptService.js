import Transcript from '../models/Transcript.js';
import Video from '../models/Video.js';
import { createTranscript } from '../utils/transcription.js'; // Assume this is a utility for transcription

class TranscriptService {
    async getTranscriptByVideoId(req, res) {
        const { videoId } = req.params;
        try {
            const transcript = await Transcript.findOne({ videoId });
            if (!transcript) {
                return res.status(404).json({ message: 'Transcript not found' });
            }
            return res.json(transcript);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching transcript', error });
        }
    }

    async generateTranscript(req, res) {
        const { videoId } = req.params;
        try {
            const video = await Video.findById(videoId);
            if (!video) {
                return res.status(404).json({ message: 'Video not found' });
            }
            const rawTranscript = await createTranscript(video.audioPath);
            console.log('Raw transcript received:', rawTranscript);
            // Format transcript content
            const content = [{
                text: rawTranscript,
                timestamp: 0,
                duration: video.duration,
                confidence: 1,
                speaker: 'default'
            }];

            const newTranscript = new Transcript({
                videoId,
                content: content,
                language: 'en',
                rawTranscript: rawTranscript,
                status: 'completed',
                metadata: {
                    wordCount: rawTranscript.split(/\s+/).length,
                    speakerCount: 1,
                    averageConfidence: 1,
                    processingTime: Number(Date.now() - video.uploadDate)
                },
                completedAt: new Date()
            });

            await newTranscript.save();
            console.log('Transcript saved with metadata');
            return res.status(201).json(newTranscript);
        } catch (error) {
            return res.status(500).json({ message: 'Error generating transcript', error });
        }
    }

    async updateTranscript(req, res) {
        const { id } = req.params;
        const updates = req.body;
        try {
            const transcript = await Transcript.findByIdAndUpdate(id, updates, { new: true });
            if (!transcript) {
                return res.status(404).json({ message: 'Transcript not found' });
            }
            return res.json(transcript);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating transcript', error });
        }
    }
}

export default new TranscriptService();
