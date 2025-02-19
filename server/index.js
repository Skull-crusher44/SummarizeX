import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import videoRoutes from './routes/videoRoutes.js';
import transcriptRoutes from './routes/transcriptRoutes.js';
import notesRoutes from './routes/notesRoutes.js';

// Config
import { uploadsDir } from './config/multerConfig.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make uploads directory static
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/videos', videoRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/notes', notesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/video-analyzer', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
});
