import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import VideoUpload from '../features/VideoUpload';
import VideoList from '../features/VideoList';
import TranscriptView from '../features/TranscriptView';
import NotesView from '../features/NotesView';
import AIChat from '../features/AIChat';
import Settings from '../features/Settings';

const MainContent = ({ sidebarOpen }) => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { sm: `calc(100% - ${sidebarOpen ? 240 : 56}px)` },
        transition: theme => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Box sx={{ height: 64 }} /> {/* Toolbar spacer */}
      <Routes>
        <Route path="/upload" element={<VideoUpload />} />
        <Route path="/videos" element={<VideoList />} />
        <Route path="/transcripts/:videoId" element={<TranscriptView />} />
        <Route path="/transcripts" element={<TranscriptView />} />
        <Route path="/notes/:videoId" element={<NotesView />} />
        <Route path="/notes" element={<NotesView />} />
        <Route path="/chat" element={<AIChat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<VideoUpload />} />
      </Routes>
    </Box>
  );
};

export default MainContent;
