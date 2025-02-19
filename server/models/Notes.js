import mongoose from 'mongoose';

const mindMapNodeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['root', 'main', 'sub'],
        required: true
    },
    data: {
        label: {
            type: String,
            required: true
        },
        details: String,
        color: String,
        icon: String
    },
    position: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        }
    },
    style: {
        type: Map,
        of: String
    }
});

const mindMapEdgeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    target: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'smoothstep'
    },
    label: String,
    animated: Boolean,
    style: {
        type: Map,
        of: String
    }
});

const notesSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    transcriptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transcript',
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    keyPoints: [{
        type: String,
        required: true
    }],
    topics: [{
        title: String,
        relevance: Number,
        keywords: [String]
    }],
    mindMap: {
        nodes: [mindMapNodeSchema],
        edges: [mindMapEdgeSchema],
        layout: {
            type: String,
            default: 'radial'
        }
    },
    tags: [{
        type: String
    }],
    metadata: {
        wordCount: Number,
        topicCount: Number,
        readingTime: Number,
        complexity: {
            type: String,
            enum: ['basic', 'intermediate', 'advanced']
        }
    },
    status: {
        type: String,
        enum: ['generating', 'completed', 'error'],
        default: 'generating'
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
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes
notesSchema.index({ videoId: 1 });
notesSchema.index({ transcriptId: 1 });
notesSchema.index({ tags: 1 });
notesSchema.index({ 'topics.title': 1 });
notesSchema.index({ summary: 'text', 'keyPoints': 'text' });

// Update timestamps
notesSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Add methods
notesSchema.methods.updateStatus = async function(status, error = null) {
    this.status = status;
    if (error) {
        this.error = error;
    }
    if (status === 'completed') {
        await this.updateMetadata();
    }
    return this.save();
};

notesSchema.methods.updateProgress = async function(progress) {
    this.processingProgress = progress;
    return this.save();
};

notesSchema.methods.updateMetadata = async function() {
    const wordCount = (
        this.summary.split(/\s+/).length +
        this.keyPoints.reduce((count, point) => count + point.split(/\s+/).length, 0)
    );

    // Estimate reading time (words per minute)
    const WPM = 200;
    const readingTime = Math.ceil(wordCount / WPM);

    // Determine complexity based on various factors
    const complexityScore = this.calculateComplexityScore();
    let complexity = 'basic';
    if (complexityScore > 7) complexity = 'advanced';
    else if (complexityScore > 4) complexity = 'intermediate';

    this.metadata = {
        wordCount,
        topicCount: this.topics.length,
        readingTime,
        complexity
    };

    return this.save();
};

notesSchema.methods.calculateComplexityScore = function() {
    let score = 0;
    
    // Factor 1: Number of topics
    score += Math.min(this.topics.length / 3, 3);
    
    // Factor 2: Mind map complexity
    const mindMapComplexity = (
        this.mindMap.nodes.length / 10 +
        this.mindMap.edges.length / 15
    );
    score += Math.min(mindMapComplexity, 3);
    
    // Factor 3: Average sentence length
    const avgSentenceLength = this.summary.split(/[.!?]+/).reduce(
        (sum, sentence) => sum + sentence.split(/\s+/).length, 0
    ) / this.summary.split(/[.!?]+/).length;
    score += Math.min(avgSentenceLength / 10, 3);
    
    // Factor 4: Keyword density
    const uniqueKeywords = new Set(
        this.topics.flatMap(topic => topic.keywords)
    ).size;
    score += Math.min(uniqueKeywords / 20, 1);

    return score;
};

// Add statics
notesSchema.statics.findByVideo = function(videoId) {
    return this.findOne({ videoId });
};

notesSchema.statics.findByTopic = function(topic) {
    return this.find({
        'topics.title': { $regex: topic, $options: 'i' }
    });
};

notesSchema.statics.findByTags = function(tags) {
    return this.find({
        tags: { $in: tags }
    });
};

// Configure options
notesSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
    }
});

const Notes = mongoose.model('Notes', notesSchema);

export default Notes;
