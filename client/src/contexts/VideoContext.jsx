import { createContext, useContext, useState, useCallback } from 'react';

const VideoContext = createContext(null);

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadVideo = useCallback(async (formData, onProgress) => {
    setLoading(true);
    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
        onProgress
      });
      const data = await response.json();
      setVideos(prev => [...prev, data]);
      setError(null);
      console.log('video data after uploading returned from (video context) ' ,data);
      return data;
    } catch (err) {
      setError('Failed to upload video');
      console.error('Error uploading video:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVideo = useCallback(async (videoId) => {
    setLoading(true);
    try {
      await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE'
      });
      setVideos(prev => prev.filter(video => video._id !== videoId));
      if (currentVideo?._id === videoId) {
        setCurrentVideo(null);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete video');
      console.error('Error deleting video:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentVideo]);

  const processVideo = useCallback(async (videoId) => {
    try {
      const response = await fetch(`/api/videos/process/${videoId}`, {
        method: 'POST'
      });
      const data = await response.json();
      setVideos(prev =>
        prev.map(video =>
          video._id === videoId ? { ...video, status: 'processing' } : video
        )
      );
      return data;
    } catch (err) {
      setError('Failed to process video');
      console.error('Error processing video:', err);
      throw err;
    }
  }, []);

  const value = {
    videos,
    currentVideo,
    loading,
    error,
    setCurrentVideo,
    fetchVideos,
    uploadVideo,
    deleteVideo,
    processVideo
  };
  console.log('videos in video context ', videos);
  console.log('current video in video context ', currentVideo);
  console.log('loading in video context ', loading);
  console.log('error in video context ', error);
  console.log('current video in video context ', currentVideo);

  

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
};
