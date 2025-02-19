import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    // Logic to save the API key or other settings
    console.log('API Key saved:', apiKey);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', pt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        <TextField
          fullWidth
          label="OpenAI API Key"
          variant="outlined"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </Paper>
    </Box>
  );
};

export default Settings;
