import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  CircularProgress,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useVideo } from '../../contexts/VideoContext';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const TranscriptSegment = ({ segment, currentTime, onSeek, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(segment.text);
  const theme = useTheme();

  const isActive = currentTime >= segment.start && currentTime < segment.end;

  const handleSave = async () => {
    await onEdit(segment.id, editedText);
    setIsEditing(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.08)' : 'background.paper',
        borderLeft: '4px solid',
        borderColor: isActive ? 'primary.main' : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'rgba(59, 130, 246, 0.04)'
        }
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => onSeek(segment.start)}
          >
            {formatTime(segment.start)}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              variant="outlined"
              size="small"
              autoFocus
              sx={{ mb: 1 }}
            />
          ) : (
            <Typography>{segment.text}</Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1}>
          {isEditing ? (
            <>
              <IconButton size="small" onClick={handleSave}>
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setIsEditing(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <IconButton size="small" onClick={() => setIsEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

const TranscriptView = () => {
  const { videoId } = useParams();
  const { currentVideo, loading: videoLoading } = useVideo();
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoId && currentVideo?._id) {
      navigate(`/transcripts/${currentVideo._id}`);
    } else if (videoId) {
      fetchTranscript();
    }
  }, [videoId, currentVideo]);

  const fetchTranscript = async () => {
    try {
      const { data } = await axios.get(`/api/transcripts/${videoId}`);
      setTranscript(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      setError('Failed to load transcript. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEdit = async (segmentId, newText) => {
    try {
      await axios.put(`/api/transcripts/segments/${segmentId}`, { text: newText });
      setTranscript(prev => ({
        ...prev,
        segments: prev.segments.map(seg =>
          seg.id === segmentId ? { ...seg, text: newText } : seg
        )
      }));
    } catch (error) {
      console.error('Error updating segment:', error);
      setError('Failed to update transcript. Please try again.');
    }
  };

  const handleCopyTranscript = () => {
    if (transcript) {
      const text = transcript.segments.map(seg => seg.text).join('\n');
      navigator.clipboard.writeText(text);
    }
  };

  if (loading || videoLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!transcript && !loading) {
    return (
      <Box sx={{ mt: 4, p: 3 }}>
        <Alert severity="info">
          No transcript available for this video yet. Please wait while we process it.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Box sx={{ width: '60%' }}>
          <video
            ref={videoRef}
            onTimeUpdate={handleTimeUpdate}
            controls
            width="100%"
            style={{ borderRadius: 8 }}
          >
            <source src={transcript?.videoUrl} type="video/mp4" />
          </video>
        </Box>

        <Box sx={{ width: '40%' }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={handlePlayPause}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <TextField
                fullWidth
                size="small"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Tooltip title="Copy Transcript">
                <IconButton onClick={handleCopyTranscript}>
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>

          <Box sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', pr: 2 }}>
            <AnimatePresence>
              {transcript?.segments
                .filter(seg => 
                  seg.text.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((segment) => (
                  <TranscriptSegment
                    key={segment.id}
                    segment={segment}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                    onEdit={handleEdit}
                  />
                ))}
            </AnimatePresence>
          </Box>
        </Box>
      </Stack>

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

export default TranscriptView;
