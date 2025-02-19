import { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { VideoProvider } from './contexts/VideoContext';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6', // Bright blue
    },
    secondary: {
      main: '#10B981', // Emerald green
    },
    background: {
      default: '#111827', // Dark blue-gray
      paper: '#1F2937',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <VideoProvider>
        <Router>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <MainContent sidebarOpen={sidebarOpen} />
          </Box>
        </Router>
      </VideoProvider>
    </ThemeProvider>
  );
}

export default App;
