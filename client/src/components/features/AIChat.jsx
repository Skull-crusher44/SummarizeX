import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  Avatar,
  CircularProgress,
  Tooltip,
  useTheme,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  RestartAlt as RestartIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const Message = ({ message, onCopy }) => {
  const theme = useTheme();
  const isBot = message.sender === 'bot';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: 2,
          ...(isBot && {
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
            p: 2,
            borderRadius: 2
          })
        }}
      >
        <Avatar
          sx={{
            bgcolor: isBot ? 'primary.main' : 'secondary.main',
            width: 32,
            height: 32
          }}
        >
          {isBot ? <BotIcon /> : <PersonIcon />}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Typography
              variant="subtitle2"
              sx={{ mb: 0.5, color: isBot ? 'primary.main' : 'secondary.main' }}
            >
              {isBot ? 'AI Assistant' : 'You'}
            </Typography>
            {isBot && (
              <Tooltip title="Copy Response">
                <IconButton 
                  size="small" 
                  onClick={() => onCopy(message.content)}
                  sx={{ color: 'text.secondary' }}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              '& code': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: 1,
                p: 0.5,
                fontFamily: 'monospace'
              }
            }}
          >
            {message.content}
          </Typography>
        </Box>
      </Stack>
    </motion.div>
  );
};

const AIChat = () => {
  const { videoId } = useParams();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      content: 'Hi! I can help you understand the video content better. Ask me anything about the video!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/chat', {
        message: input,
        videoId
      });

      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        content: data.response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        content: 'Hi! I can help you understand the video content better. Ask me anything about the video!'
      }
    ]);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <BotIcon color="primary" />
            <Typography variant="h6">AI Chat Assistant</Typography>
          </Stack>
          <Tooltip title="Reset Conversation">
            <IconButton onClick={handleReset} color="primary">
              <RestartIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Messages */}
      <Paper 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2,
          overflowY: 'auto',
          backgroundColor: theme.palette.background.paper
        }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onCopy={handleCopy}
            />
          ))}
        </AnimatePresence>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask about the video content..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            sx={{ 
              alignSelf: 'flex-end',
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              },
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Paper>

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

export default AIChat;
