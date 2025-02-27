# Video Learning Assistant

A full-stack application that helps users learn from video content through AI-powered features including automatic transcription, note-taking, mind mapping, and an AI chat assistant.

## Features

- **Video Upload & Management**: Upload and organize your learning videos
- **Automatic Transcription**: Get accurate transcriptions of video content using Whisper AI
- **Smart Note-Taking**: Take and organize notes while watching videos
- **Mind Map Generation**: Automatically generate mind maps from video content
- **AI Chat Assistant**: Get instant answers and explanations about the video content
- **Interactive UI**: Clean and intuitive interface for seamless learning experience

## Tech Stack

### Frontend (Client)
- React + Vite
- Context API for state management
- Modern responsive design

### Backend (Server)
- Node.js
- Express.js
- OpenAI integration
- Whisper AI for transcription
- File upload handling with Multer

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   
└── server/                # Backend Node.js application
    ├── config/            # Configuration files
    ├── models/            # Data models
    ├── routes/            # API routes
    ├── services/          # Business logic
    └── utils/             # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install frontend dependencies
```bash
cd client
npm install
```

3. Install backend dependencies
```bash
cd server
npm install
```

4. Configure environment variables
Create a `.env` file in the server directory with:
```
PORT=3000
OPENAI_API_KEY=your_api_key
```

5. Start the development servers

Frontend:
```bash
cd client
npm run dev
```

Backend:
```bash
cd server
npm run dev
```

## API Endpoints

### Videos
- `POST /api/videos/upload` - Upload a new video
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get video by ID

### Transcripts
- `GET /api/transcripts/:videoId` - Get transcript for a video
- `POST /api/transcripts/generate` - Generate new transcript

### Notes
- `POST /api/notes` - Create new notes
- `GET /api/notes/:videoId` - Get notes for a video
- `PUT /api/notes/:id` - Update notes
- `DELETE /api/notes/:id` - Delete notes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
