import { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton,
  Typography,
  Tooltip,
  styled
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  VideoLibrary as VideoIcon,
  Description as TranscriptIcon,
  NoteAlt as NotesIcon,
  Upload as UploadIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVideo } from '../../contexts/VideoContext';

const DRAWER_WIDTH = 260;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: theme.spacing(0.8, 1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
}));

const Logo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0, 2),
  '& svg': {
    fontSize: 24,
    color: theme.palette.primary.main,
  },
}));

const menuItems = [
  { text: 'Upload Video', icon: <UploadIcon />, path: '/upload' },
  { text: 'My Videos', icon: <VideoIcon />, path: '/videos' },
  { text: 'Transcripts', icon: <TranscriptIcon />, path: '/transcripts' },
  { text: 'AI Notes', icon: <NotesIcon />, path: '/notes' },
  { text: 'AI Chat', icon: <ChatIcon />, path: '/chat' },
];

const Sidebar = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentVideo } = useVideo();

  const handleNavigation = (path) => {
    if (path === '/transcripts') {
      // If we have a current video, navigate to its transcript
      if (currentVideo?._id) {
        navigate(`/transcripts/${currentVideo._id}`);
      } else {
        // If no current video, navigate to videos list
        navigate('/videos');
      }
    } else if (path === '/notes') {
      // Similar handling for notes
      if (currentVideo?._id) {
        navigate(`/notes/${currentVideo._id}`);
      } else {
        navigate('/videos');
      }
    } else {
      navigate(path);
    }
  };

  const isActiveRoute = (path) => {
    if (path === '/transcripts') {
      return location.pathname.startsWith('/transcripts');
    }
    if (path === '/notes') {
      return location.pathname.startsWith('/notes');
    }
    return location.pathname === path;
  };

  return (
    <Drawer 
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : theme => theme.spacing(9),
        transition: theme => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : theme => theme.spacing(9),
          overflowX: 'hidden',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <DrawerHeader>
        {open && (
          <Logo>
            <NotesIcon color="primary" />
            <Typography variant="h6" color="primary" fontWeight="600">
              NoteGPT
            </Typography>
          </Logo>
        )}
        <IconButton onClick={onToggle} sx={{ color: 'primary.main' }}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <Tooltip 
            key={item.text} 
            title={!open ? item.text : ''} 
            placement="right"
          >
            <StyledListItem
              button
              active={isActiveRoute(item.path) ? 1 : 0}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: 48,
                px: 2.5,
                justifyContent: open ? 'initial' : 'center',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isActiveRoute(item.path) ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActiveRoute(item.path) ? 600 : 400,
                      color: isActiveRoute(item.path) ? 'primary.main' : 'text.primary',
                    },
                  }}
                />
              )}
            </StyledListItem>
          </Tooltip>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {open && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <StyledListItem
            button
            onClick={() => handleNavigation('/settings')}
            sx={{ minHeight: 48, px: 2.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: 3 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </StyledListItem>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;
