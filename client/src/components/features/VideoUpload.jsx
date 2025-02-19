import { useState, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  LinearProgress, 
  IconButton,
  Stack,
  Divider,
  useTheme,
  Alert,
  Snackbar,
  TextField
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  Description as TextIcon,
  Close as CloseIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useVideo } from '../../contexts/VideoContext';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const UploadBox = ({ isDragActive, getRootProps, getInputProps }) => {
  const theme = useTheme();
  
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...getRootProps()}
      sx={{
        p: 6,
        background: theme.palette.background.paper,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'rgba(59, 130, 246, 0.04)'
        }
      }}
    >
      <input {...getInputProps()} />
      <Stack spacing={2} alignItems="center">
        <motion.div
          animate={{
            y: isDragActive ? -10 : 0,
            scale: isDragActive ? 1.1 : 1
          }}
        >
          <FileUploadIcon 
            sx={{ 
              fontSize: 64,
              color: isDragActive ? 'primary.main' : 'text.secondary'
            }} 
          />
        </motion.div>
        <Typography variant="h6" color={isDragActive ? 'primary' : 'textPrimary'}>
          {isDragActive ? 'Drop your video here' : 'Drag & drop your video here'}
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          or click to browse
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          Supported formats: MP4, WebM, QuickTime (max 100MB)
        </Typography>
      </Stack>
    </Paper>
  );
};

const UploadProgress = ({ file, progress, onCancel, status }) => (
  <Paper
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    sx={{ p: 3, mt: 3 }}
  >
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2">{file.name}</Typography>
        <IconButton size="small" onClick={onCancel}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{
          height: 6,
          borderRadius: 3,
          '& .MuiLinearProgress-bar': {
            borderRadius: 3
          }
        }}
      />
      <Typography variant="caption" color="textSecondary">
        {status === 'uploading' ? `${progress}% uploaded` : 'Generating transcript...'}
      </Typography>
    </Stack>
  </Paper>
);

const UploadOptions = () => (
  <Box sx={{ mt: 4 }}>
    <Divider sx={{ my: 4 }}>
      <Typography variant="body2" color="textSecondary">
        OR
      </Typography>
    </Divider>
    <Stack 
      direction={{ xs: 'column', sm: 'row' }} 
      spacing={2} 
      justifyContent="center"
    >
      <Button
        variant="outlined"
        startIcon={<LinkIcon />}
        sx={{ minWidth: 200 }}
      >
        Add YouTube Link
      </Button>
      <Button
        variant="outlined"
        startIcon={<TextIcon />}
        sx={{ minWidth: 200 }}
      >
        Upload Text File
      </Button>
    </Stack>
  </Box>
);

const VideoUpload = () => {
  const { uploadVideo, processVideo, setCurrentVideo } = useVideo();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setTitle(file.name.split('.')[0]); // Set default title from filename
    }
  }, []);

  const handleUpload = async () => {
    if (!title.trim()) {
      setError('Please enter a title for the video');
      return;
    }

    setUploading(true);
    setError(null);
    setStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title.trim());

      // Upload video using context
      const uploadedVideo = await uploadVideo(formData, (event) => {
        const progress = Math.round((event.loaded * 100) / event.total);
        setProgress(progress);
      });

      if (uploadedVideo && uploadedVideo.id) {
        setCurrentVideo(uploadedVideo);
        console.log('Video uploaded successfully(in videoUplaod):', uploadedVideo);
        
        setStatus('processing');
        try {
          // Process video using context
          await processVideo(uploadedVideo.id);
          console.log('Video processed successfully');

          // Generate transcript
          await axios.post(`/api/transcripts/generate/${uploadedVideo.id}`);
          console.log('Transcript generated successfully');

          // Navigate to transcript view
          navigate(`/transcripts/${uploadedVideo.id}`);
        } catch (error) {
          console.error('Error in processing/transcription:', error);
        }
      }

      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setFile(null);
        setTitle('');
        setProgress(0);
        setStatus('idle');
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload video. Please try again.');
      setUploading(false);
      setStatus('idle');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false
  });

  const handleCancel = () => {
    setFile(null);
    setTitle('');
    setUploading(false);
    setProgress(0);
    setError(null);
    setStatus('idle');
  };

  return (
    <Box maxWidth="md" mx="auto">
      <UploadBox 
        isDragActive={isDragActive} 
        getRootProps={getRootProps} 
        getInputProps={getInputProps} 
      />
      
      <AnimatePresence>
        {file && !uploading && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            sx={{ p: 3, mt: 3 }}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Video Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={handleCancel} color="inherit">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!title.trim()}
                >
                  Upload Video
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {file && uploading && (
          <UploadProgress 
            file={file} 
            progress={progress} 
            onCancel={handleCancel}
            status={status}
          />
        )}
      </AnimatePresence>

      <UploadOptions />

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VideoUpload;
