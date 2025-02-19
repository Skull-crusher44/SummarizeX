import { useState } from 'react';
import { Box, Button, Typography, LinearProgress, Paper, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import axios from 'axios';

const VideoUpload = ({ onVideoProcessed }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [videoId, setVideoId] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', file.name);

        setUploading(true);
        setError(null);
        setVideoId(null);

        try {
            const response = await axios.post('http://localhost:5000/api/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / progressEvent.total) * 100;
                    setProgress(Math.round(progress));
                },
            });

            setVideoId(response.data.id);
        } catch (error) {
            setError(error.response?.data?.error || 'Error uploading video');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleGenerate = async () => {
        if (!videoId) return;

        setGenerating(true);
        setError(null);

        try {
            try {
                // Step 1: Process Video
                setGenerationStep('processing');
                await axios.post(`http://localhost:5000/api/videos/process/${videoId}`);
            } catch (error) {
                throw new Error('Failed to process video: ' + (error.response?.data?.error || error.message));
            }

            try {
                // Step 2: Generate Transcript
                setGenerationStep('transcript');
                await axios.post(`http://localhost:5000/api/transcripts/generate/${videoId}`);
                const transcriptResponse = await axios.get(`http://localhost:5000/api/transcripts/${videoId}`);
                if (!transcriptResponse.data) {
                    throw new Error('Failed to generate transcript');
                }
            } catch (error) {
                throw new Error('Failed to generate transcript: ' + (error.response?.data?.error || error.message));
            }

            try {
                // Step 3: Generate Notes and Mind Map
                setGenerationStep('notes');
                await axios.post(`http://localhost:5000/api/notes/generate/${videoId}`);
                
                // Get final results
                const notesResponse = await axios.get(`http://localhost:5000/api/notes/${videoId}`);
                if (!notesResponse.data) {
                    throw new Error('Failed to generate notes and mind map');
                }

                const transcriptResponse = await axios.get(`http://localhost:5000/api/transcripts/${videoId}`);
                
                onVideoProcessed({
                    videoId,
                    transcript: transcriptResponse.data,
                    notes: notesResponse.data.notes,
                    mindMap: notesResponse.data.mindMap
                });
            } catch (error) {
                throw new Error('Failed to generate notes and mind map: ' + (error.response?.data?.error || error.message));
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setGenerating(false);
            setGenerationStep(null);
        }
    };

    const getStepMessage = () => {
        switch (generationStep) {
            case 'processing':
                return 'Processing video...';
            case 'transcript':
                return 'Generating transcript...';
            case 'notes':
                return 'Generating notes and mind map...';
            default:
                return '';
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
                <Stack spacing={2} alignItems="center">
                    <input
                        accept="video/*"
                        style={{ display: 'none' }}
                        id="video-upload"
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploading || generating}
                    />
                    <label htmlFor="video-upload">
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            disabled={uploading || generating}
                        >
                            Upload Video
                        </Button>
                    </label>

                    {uploading && (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress variant="determinate" value={progress} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {progress}% uploaded
                            </Typography>
                        </Box>
                    )}

                    {videoId && !generating && (
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<AnalyticsIcon />}
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            Generate Analysis
                        </Button>
                    )}

                    {generating && (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {getStepMessage()}
                            </Typography>
                        </Box>
                    )}

                    {error && (
                        <Typography color="error">
                            {error}
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
};

export default VideoUpload;
