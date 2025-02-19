import fs from 'fs';
import path from 'path';

// Function to move uploaded file to a specific directory
export const moveFile = (source, destination) => {
    return new Promise((resolve, reject) => {
        const destDir = path.dirname(destination);
        fs.mkdir(destDir, { recursive: true }, (err) => {
            if (err) return reject(err);
            fs.rename(source, destination, (err) => {
                if (err) return reject(err);
                resolve(destination);
            });
        });
    });
};

// Function to delete a file
export const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Function to validate uploaded file
export const validateFile = (file) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only MP4, WebM, and QuickTime videos are allowed.');
    }

    if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 100MB.');
    }

    return true;
};
