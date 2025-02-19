import { Box, Paper, Typography, Divider, List, ListItem, ListItemText } from '@mui/material';

const NotesView = ({ notes, transcript }) => {
    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            {notes && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Generated Notes
                    </Typography>
                    <List>
                        {notes.map((note, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={note.title}
                                    secondary={note.content}
                                    secondaryTypographyProps={{
                                        sx: { whiteSpace: 'pre-wrap' }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {transcript && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Transcript
                    </Typography>
                    <Box sx={{ 
                        maxHeight: '400px', 
                        overflowY: 'auto',
                        bgcolor: 'background.paper',
                        p: 2,
                        borderRadius: 1
                    }}>
                        <List>
                            {transcript.map((segment, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={`${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}`}
                                        secondary={segment.text}
                                        secondaryTypographyProps={{
                                            sx: { whiteSpace: 'pre-wrap' }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            )}

            {!notes && !transcript && (
                <Typography variant="body1" color="text.secondary">
                    No notes or transcript available yet. Upload a video to get started.
                </Typography>
            )}
        </Paper>
    );
};

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default NotesView;
