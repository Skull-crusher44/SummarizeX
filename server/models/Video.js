import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 255
    },
    filename: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'transcribing', 'analyzing', 'completed', 'error'],
        default: 'uploaded',
        required: true
    },
    error: {
        type: String,
        trim: true
    },
    processingProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    audioPath: {
        type: String,
        trim: true
    },
    thumbnailPath: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
videoSchema.index({ status: 1 });
videoSchema.index({ createdAt: 1 });
videoSchema.index({ title: 'text' }); // Enable text search on title

// Pre-save middleware
videoSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
videoSchema.methods.updateStatus = async function(status, error = null) {
    this.status = status;
    if (error) {
        this.error = error;
    }
    return this.save();
};

videoSchema.methods.updateProgress = async function(progress) {
    if (progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100');
    }
    this.processingProgress = progress;
    return this.save();
};

videoSchema.methods.setError = async function(error) {
    this.status = 'error';
    this.error = error;
    return this.save();
};

// Static methods
videoSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

videoSchema.statics.findPending = function() {
    return this.find({
        status: { 
            $in: ['uploaded', 'processing', 'transcribing', 'analyzing']
        }
    }).sort({ createdAt: -1 });
};

videoSchema.statics.findFailed = function() {
    return this.find({ status: 'error' }).sort({ createdAt: -1 });
};

videoSchema.statics.findRecent = function(limit = 10) {
    return this.find().sort({ createdAt: -1 }).limit(limit);
};

// Virtuals
videoSchema.virtual('isProcessing').get(function() {
    return ['processing', 'transcribing', 'analyzing'].includes(this.status);
});

videoSchema.virtual('isComplete').get(function() {
    return this.status === 'completed';
});

videoSchema.virtual('hasError').get(function() {
    return this.status === 'error';
});

videoSchema.virtual('durationFormatted').get(function() {
    if (!this.duration) return '00:00';
    const minutes = Math.floor(this.duration / 60);
    const seconds = Math.floor(this.duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Configure options
videoSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        // Don't expose file paths in JSON
        delete ret.path;
        delete ret.audioPath;
        return ret;
    }
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
