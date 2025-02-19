import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    content: [{
        text: {
            type: String,
            required: true
        },
        timestamp: {
            type: Number,
            required: true
        },
        duration: {
            type: Number
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
        speaker: {
            type: String,
            default: 'unknown'
        }
    }],
    language: {
        type: String,
        default: 'en'
    },
    metadata: {
        wordCount: Number,
        speakerCount: Number,
        averageConfidence: Number,
        processingTime: Number
    },
    rawTranscript: {
        type: String,
        select: false // Only load when explicitly requested
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'error'],
        default: 'processing'
    },
    error: {
        type: String
    },
    processingProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

// Add indexes
transcriptSchema.index({ videoId: 1 });
transcriptSchema.index({ status: 1 });
transcriptSchema.index({ 'content.text': 'text' }); // Enable text search

// Add methods
transcriptSchema.methods.updateStatus = async function(status, error = null) {
    this.status = status;
    if (error) {
        this.error = error;
    }
    if (status === 'completed') {
        this.completedAt = new Date();
        await this.updateMetadata();
    }
    return this.save();
};

transcriptSchema.methods.updateProgress = async function(progress) {
    this.processingProgress = progress;
    return this.save();
};

transcriptSchema.methods.updateMetadata = async function() {
    // Calculate metadata
    const wordCount = this.content.reduce((count, segment) => 
        count + segment.text.split(/\s+/).length, 0
    );

    const speakers = new Set(this.content.map(segment => segment.speaker));
    
    const totalConfidence = this.content.reduce((sum, segment) => 
        sum + (segment.confidence || 0), 0
    );

    this.metadata = {
        wordCount,
        speakerCount: speakers.size,
        averageConfidence: totalConfidence / this.content.length,
        processingTime: this.completedAt 
            ? (this.completedAt - this.createdAt) / 1000 
            : null
    };

    return this.save();
};

// Add statics
transcriptSchema.statics.findByVideo = function(videoId) {
    return this.findOne({ videoId });
};

transcriptSchema.statics.searchText = function(query) {
    return this.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
};

// Add virtuals
transcriptSchema.virtual('duration').get(function() {
    if (!this.content.length) return 0;
    const lastSegment = this.content[this.content.length - 1];
    return lastSegment.timestamp + (lastSegment.duration || 0);
});

transcriptSchema.virtual('isComplete').get(function() {
    return this.status === 'completed';
});

transcriptSchema.virtual('hasError').get(function() {
    return this.status === 'error';
});

// Configure options
transcriptSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        // Don't expose raw transcript in JSON
        delete ret.rawTranscript;
        return ret;
    }
});

const Transcript = mongoose.model('Transcript', transcriptSchema);

export default Transcript;
