import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract audio from video
export const extractAudio = async (videoPath) => {
    return new Promise((resolve, reject) => {
        const audioFileName = `audio-${Date.now()}.wav`;
        const audioPath = path.join(__dirname, '..', 'uploads', 'audio', audioFileName);

        ffmpeg(videoPath)
            .toFormat('wav')
            .audioChannels(1)
            .audioFrequency(16000)
            .on('progress', (progress) => {
                console.log(`Processing: ${progress.percent}% done`);
            })
            .on('end', () => {
                console.log('Audio extraction completed');
                resolve(audioPath);
            })
            .on('error', (err) => {
                console.error('Error:', err);
                reject(new Error('Failed to extract audio'));
            })
            .save(audioPath);
    });
};

// Function to transcribe audio using Whisper API
export const transcribeAudio = async (audioPath) => {
    const { Whisper } = await import('whisper-api'); // Assume this is the Whisper API client

    const whisper = new Whisper({
        apiKey: process.env.WHISPER_API_KEY
    });

    try {
        const audioStream = createReadStream(audioPath);
        const response = await whisper.transcribe(audioStream);

        if (response.status !== 'success') {
            throw new Error('Transcription failed');
        }

        return response.data.map(segment => ({
            text: segment.text,
            timestamp: segment.start,
            duration: segment.end - segment.start,
            confidence: segment.confidence,
            speaker: segment.speaker || 'unknown'
        }));
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw new Error('Failed to transcribe audio');
    }
};
