import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import Video from '../models/Video.js';
import { uploadsDir, audioDir } from '../config/multerConfig.js';

const PROCESSING_TIMEOUT = 30 * 60 * 1000; // 30 minutes

class VideoService {
    constructor() {
        this.uploadsDir = uploadsDir;
        this.audioDir = audioDir;
    }

    async uploadVideo(req, res) {
        if (!req.file) {
            throw new Error('No video file uploaded');
        }

        const video = new Video({
            title: req.body.title || 'Untitled Video',
            filename: req.file.filename,
            path: req.file.path,
            status: 'uploaded',
            uploadDate: new Date()
        });

        try {
            await video.save();
            return {
                id: video._id,
                title: video.title,
                status: video.status
            };
        } catch (error) {
            // Clean up the uploaded file if database save fails
            await fs.unlink(req.file.path).catch(console.error);
            throw error;
        }
    }

    async getAllVideos() { 
        const allvideos = await Video.find();
        return allvideos;
    }
    async getVideoById(videoId) {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new Error('Video not found');
        }
        return video;
    }

    async processVideo(videoId) {
        const video = await Video.findById(videoId);
        if (!video) {
            throw new Error('Video not found');
        }

        let processingTimeout;
        const timeoutPromise = new Promise((_, reject) => {
            processingTimeout = setTimeout(() => {
                reject(new Error('Video processing timeout'));
            }, PROCESSING_TIMEOUT);
        });

        try {
            await video.updateStatus('processing');
            
            // Process the video with a timeout
            const processingPromise = this._processVideoSteps(video);
            const result = await Promise.race([processingPromise, timeoutPromise]);
            
            clearTimeout(processingTimeout);
            return result;
        } catch (error) {
            clearTimeout(processingTimeout);
            await video.updateStatus('error', error.message);
            throw error;
        }
    }

    async _processVideoSteps(video) {
        try {
            // Extract audio
            const audioPath = await this.extractAudio(video.path);
            video.audioPath = audioPath;
            await video.save();
            
            // Get video duration
            const duration = await this.getVideoDuration(video.path);
            video.duration = duration;
            await video.save();
            
            // Generate thumbnail
            // const thumbnailPath = await this.generateThumbnail(video.path);
            // video.thumbnailPath = thumbnailPath;
            // await video.save();
            
            // Update video status
            await video.updateStatus('transcribing');
                        
            return {
                audioPath: video.audioPath,
                duration: video.duration,
                thumbnailPath: video.thumbnailPath
            };
        } catch (error) {
            throw error;
        }
    }

    async extractAudio(videoPath) {
        const exists = await fs.access(videoPath).then(() => true).catch(() => false);
        if (!exists) {
            throw new Error('Video file not found');
        }

        return new Promise((resolve, reject) => {
            const audioFileName = `audio-${Date.now()}.wav`;
            const audioPath = path.join(this.audioDir, audioFileName);

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
                    reject(new Error('Failed to extract audio: ' + err.message));
                })
                .save(audioPath);
        });
    }

    async getVideoDuration(videoPath) {
        const exists = await fs.access(videoPath).then(() => true).catch(() => false);
        if (!exists) {
            throw new Error('Video file not found');
        }

        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    reject(new Error('Failed to get video duration: ' + err.message));
                    return;
                }
                if (!metadata || !metadata.format || !metadata.format.duration) {
                    reject(new Error('Invalid video format'));
                    return;
                }
                console.log('video duration extraction completed');
                resolve(metadata.format.duration);
            });
        });
    }

    async generateThumbnail(videoPath) {
        const exists = await fs.access(videoPath).then(() => true).catch(() => false);
        if (!exists) {
            throw new Error('Video file not found');
        }

        // Create thumbnails directory if it doesn't exist
        return new Promise((resolve, reject) => {

            const thumbnailFileName = `thumbnail-${Date.now()}.jpg`;
            const thumbnailPath = path.join(this.uploadsDir, thumbnailFileName);

            ffmpeg(videoPath)
                .inputOptions(['-ss', '00:00:01'])
                .outputOptions(['-vframes', '1'])
                .output(thumbnailPath)
                .on('start', (cmd) => {
                    console.log('Started ffmpeg with command:', cmd);
                })
                .on('end', () => {
                    console.log('Thumbnail generation completed');
                    resolve(thumbnailPath);
                })
                .on('error', (err) => {
                    console.error('Thumbnail generation error:', err);
                    reject(new Error('Failed to generate thumbnail: ' + err.message));
                })
                .run();
        });
    }

    async cleanup(videoId) {
        try {
            const video = await Video.findById(videoId);
            
            // If video document exists, delete associated files
            if (video) {
                const filesToDelete = [
                    { path: video.path, type: 'video' },
                    { path: video.audioPath, type: 'audio' },
                    { path: video.thumbnailPath, type: 'thumbnail' }
                ];

                for (const file of filesToDelete) {
                    if (file.path) {
                        try {
                            const exists = await fs.access(file.path).then(() => true).catch(() => false);
                            if (exists) {
                                await fs.unlink(file.path);
                                console.log(`Deleted ${file.type} file: ${file.path}`);
                            }
                        } catch (err) {
                            console.error(`Failed to delete ${file.type} file:`, err);
                        }
                    }
                }

                // Delete the video document
                await Video.findByIdAndDelete(videoId);
                console.log(`Deleted video document with ID: ${videoId}`);
            } else {
                console.log(`Video document with ID: ${videoId} not found, skipping cleanup`);
            }
        } catch (error) {
            console.error('Cleanup error:', error);
            throw new Error('Failed to cleanup video resources: ' + error.message);
        }
    }

    async validateVideoRequest(req) {
        if (!req.file) {
            throw new Error('No video file provided');
        }

        if (!req.body.title) {
            throw new Error('Video title is required');
        }

        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!allowedTypes.includes(req.file.mimetype)) {
            throw new Error('Invalid file type. Only MP4, WebM, and QuickTime videos are allowed.');
        }

        if (req.file.size > maxSize) {
            throw new Error('File too large. Maximum size is 100MB.');
        }

        return true;
    }
}

export default new VideoService();
