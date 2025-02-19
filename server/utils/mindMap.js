import { createMindMap } from 'mindmap-generator'; // Assume this is a library for generating mind maps

// Function to generate a mind map from transcript
export const generateMindMap = (transcript) => {
    const nodes = transcript.content.map((segment, index) => ({
        id: `node-${index}`,
        type: 'default',
        data: { label: segment.text },
        position: { x: Math.random() * 800, y: Math.random() * 600 }
    }));

    const edges = transcript.content.map((segment, index) => {
        if (index < transcript.content.length - 1) {
            return {
                id: `edge-${index}`,
                source: `node-${index}`,
                target: `node-${index + 1}`,
                type: 'smoothstep'
            };
        }
        return null;
    }).filter(edge => edge !== null);

    return {
        nodes,
        edges
    };
};

// Function to summarize the transcript
export const summarizeTranscript = (transcript) => {
    const summary = transcript.content.map(segment => segment.text).join(' ').slice(0, 200);
    return {
        summary,
        keyPoints: transcript.content.map(segment => segment.text).slice(0, 5)
    };
};
