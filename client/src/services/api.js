import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Videos API
export const videoAPI = {
  upload: (formData, onUploadProgress) => {
    return api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    });
  },
  getAll: () => api.get('/videos'),
  getById: (id) => api.get(`/videos/${id}`),
  delete: (id) => api.delete(`/videos/${id}`),
  process: (id) => api.post(`/videos/process/${id}`)
};

// Transcripts API
export const transcriptAPI = {
  getByVideoId: (videoId) => api.get(`/transcripts/${videoId}`),
  generate: (videoId) => api.post(`/transcripts/generate/${videoId}`),
  update: (id, updates) => api.put(`/transcripts/${id}`, updates)
};

// Notes API
export const notesAPI = {
  getByVideoId: (videoId) => api.get(`/notes/${videoId}`),
  generate: (videoId, promptData) => api.post(`/notes/generate/${videoId}`, promptData),
  update: (id, updates) => api.put(`/notes/${id}`, updates),
  getSamplePrompts: () => api.get('/notes/prompts/samples')
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
);

export default api;
