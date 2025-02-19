import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Stack,
  LinearProgress,
  useTheme,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  PlayArrow as PlayIcon,
  Description as TranscriptIcon,
  NoteAlt as NotesIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useVideo } from '../../contexts/VideoContext';

const VideoCard = ({ video, onAction, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleMenuClose();
    if (action === 'delete') {
      onDelete(video._id);
    } else {
      onAction(action, video);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: 'background.paper',
        '&:hover': {
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={video.thumbnailPath || '/placeholder-video.png'}
          alt={video.title}
          sx={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: '0.2s',
            '&:hover': {
              opacity: 1,
            }
          }}
        >
          <IconButton
            size="large"
            sx={{ 
              color: 'white',
              '&:hover': { transform: 'scale(1.1)' }
            }}
            onClick={() => handleAction('play')}
          >
            <PlayIcon sx={{ fontSize: 48 }} />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Stack spacing={1}>
          <Typography variant="h6" noWrap>
            {video.title}
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={video.status}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(video.status)}15`,
                color: getStatusColor(video.status),
                fontWeight: 500
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {new Date(video.uploadDate).toLocaleDateString()}
            </Typography>
          </Stack>

          {video.status === 'processing' && (
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={video.processingProgress || 0}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'primary.main',
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          )}
        </Stack>
      </CardContent>

      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Transcript">
            <IconButton 
              size="small"
              onClick={() => handleAction('transcript')}
              sx={{ color: 'text.secondary' }}
            >
              <TranscriptIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Notes">
            <IconButton 
              size="small"
              onClick={() => handleAction('notes')}
              sx={{ color: 'text.secondary' }}
            >
              <NotesIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{ color: 'text.secondary' }}
        >
          <MoreIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete Video
        </MenuItem>
      </Menu>
    </Card>
  );
};

const VideoList = () => {
  const { 
    videos, 
    loading, 
    error, 
    fetchVideos, 
    deleteVideo, 
    setCurrentVideo 
  } = useVideo();
  const navigate = useNavigate();

  
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
  
  const handleVideoAction = async (action, video) => {
    try {
      switch (action) {
        case 'play':
          // Handle video playback
          break;
        case 'transcript':
          setCurrentVideo(video);
          navigate(`/transcripts/${video._id}`);
          break;
          case 'notes':
            setCurrentVideo(video);
            navigate(`/notes/${video._id}`);
          break;
      }
    } catch (error) {
      console.error('Error handling video action:', error);
    }
  };
  
  const handleDelete = async (videoId) => {
    try {
      await deleteVideo(videoId);
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }
  
  console.log('list of videos  ' ,videos);
  return (
    <>
      <Grid container spacing={3}>
        {videos.map((video) => (
          <Grid item xs={12} sm={6} md={4} key={video._id}>
            <VideoCard 
              video={video} 
              onAction={handleVideoAction}
              onDelete={handleDelete}
            />
          </Grid>
        ))}
      </Grid>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VideoList;
