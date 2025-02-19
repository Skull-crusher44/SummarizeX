import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  IconButton,
  Stack,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  useTheme,
  Alert,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  AutoAwesome as PromptIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MindMap from '../MindMap';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const TabPanel = ({ children, value, index, ...other }) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`notes-tabpanel-${index}`}
    aria-labelledby={`notes-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ py: 3 }}>
        {children}
      </Box>
    )}
  </Box>
);

const NotesSection = ({ title, content, onEdit, onCopy }) => {
  const theme = useTheme();
  
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ 
        p: 3, 
        mb: 3,
        backgroundColor: 'background.paper',
        position: 'relative'
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy">
            <IconButton size="small" onClick={onCopy}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Typography>
    </Paper>
  );
};

const PromptDialog = ({ open, onClose, prompts, onSelect, customPrompt, onCustomPromptChange, onCustomPromptSubmit }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Choose a Prompt Style</DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Custom Prompt"
        value={customPrompt}
        onChange={onCustomPromptChange}
        sx={{ mb: 2 }}
      />
      <Button 
        fullWidth 
        variant="contained" 
        onClick={onCustomPromptSubmit}
        disabled={!customPrompt.trim()}
        sx={{ mb: 2 }}
      >
        Use Custom Prompt
      </Button>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Or choose from sample prompts:
      </Typography>
      <List>
        {prompts.map((prompt) => (
          <ListItem
            key={prompt.id}
            button
            onClick={() => onSelect(prompt)}
          >
            <ListItemIcon>
              <PromptIcon />
            </ListItemIcon>
            <ListItemText 
              primary={prompt.name}
              secondary={prompt.prompt}
            />
          </ListItem>
        ))}
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
    </DialogActions>
  </Dialog>
);

const NotesView = () => {
  const { videoId } = useParams();
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [samplePrompts, setSamplePrompts] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const theme = useTheme();

  useEffect(() => {
    fetchNotes();
    fetchPrompts();
  }, [videoId]);

  const fetchNotes = async () => {
    try {
      const { data } = await axios.get(`/api/notes/${videoId}`);
      setNotes(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to load notes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const { data } = await axios.get('/api/notes/prompts/samples');
      setSamplePrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRegenerateNotes = async (promptData = null) => {
    setRegenerating(true);
    setError(null);
    try {
      const { data } = await axios.post(`/api/notes/generate/${videoId}`, promptData);
      setNotes(data);
      setPromptDialogOpen(false);
      setCustomPrompt('');
    } catch (error) {
      console.error('Error regenerating notes:', error);
      setError('Failed to regenerate notes. Please try again.');
    } finally {
      setRegenerating(false);
      handleMenuClose();
    }
  };

  const handlePromptSelect = (prompt) => {
    handleRegenerateNotes({ promptId: prompt.id });
  };

  const handleCustomPromptSubmit = () => {
    handleRegenerateNotes({ customPrompt });
  };

  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    // Implement download functionality
    handleMenuClose();
  };

  const handleShare = () => {
    // Implement share functionality
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 3, 
          background: theme.palette.background.paper,
          borderRadius: 2
        }}
      >
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">
              Video Notes
            </Typography>
            {regenerating && (
              <CircularProgress size={20} thickness={4} />
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => setPromptDialogOpen(true)}
              disabled={regenerating}
            >
              Regenerate
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="notes tabs"
        >
          <Tab label="Summary" />
          <Tab label="Mind Map" />
          <Tab label="Key Points" />
        </Tabs>
      </Box>

      {/* Summary Tab */}
      <TabPanel value={tabValue} index={0}>
        <NotesSection
          title="Summary"
          content={notes?.summary}
          onEdit={() => {}}
          onCopy={() => handleCopyContent(notes?.summary)}
        />
      </TabPanel>

      {/* Mind Map Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper 
          sx={{ 
            p: 3,
            height: '600px',
            backgroundColor: 'background.paper'
          }}
        >
          <MindMap data={notes?.mindMap} />
        </Paper>
      </TabPanel>

      {/* Key Points Tab */}
      <TabPanel value={tabValue} index={2}>
        {notes?.keyPoints.map((point, index) => (
          <NotesSection
            key={index}
            title={`Key Point ${index + 1}`}
            content={point}
            onEdit={() => {}}
            onCopy={() => handleCopyContent(point)}
          />
        ))}
      </TabPanel>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDownload}>
          <DownloadIcon sx={{ mr: 1 }} /> Download Notes
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ShareIcon sx={{ mr: 1 }} /> Share Notes
        </MenuItem>
      </Menu>

      {/* Prompt Selection Dialog */}
      <PromptDialog
        open={promptDialogOpen}
        onClose={() => setPromptDialogOpen(false)}
        prompts={samplePrompts}
        onSelect={handlePromptSelect}
        customPrompt={customPrompt}
        onCustomPromptChange={(e) => setCustomPrompt(e.target.value)}
        onCustomPromptSubmit={handleCustomPromptSubmit}
      />

      {/* Error Snackbar */}
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

export default NotesView;
