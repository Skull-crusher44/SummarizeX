import Notes from '../models/Notes.js';
import Transcript from '../models/Transcript.js';
import { summarizeText, generateMindMapData } from '../utils/openAi.js';

class NotesService {
    async getNotesByVideoId(req, res) {
        const { videoId } = req.params;
        try {
            const notes = await Notes.findOne({ videoId });
            if (!notes) {
                return res.status(404).json({ message: 'Notes not found' });
            }
            return res.json(notes);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching notes', error });
        }
    }

    async generateNotes(req, res) {
        const { videoId } = req.params;
        const { promptId, customPrompt } = req.body;
        
        try {
            const transcript = await Transcript.findOne({ videoId });
            if (!transcript) {
                return res.status(404).json({ message: 'Transcript not found' });
            }
            
            // Get the transcript text
            const transcriptText = transcript.content.map(segment => segment.text).join(' ');
            
            // Generate notes and mind map in parallel
            const [summary, mindMapData] = await Promise.all([
                customPrompt 
                    ? summarizeText(transcriptText, customPrompt)
                    : promptId 
                        ? summarizeText(transcriptText, parseInt(promptId))
                        : summarizeText(transcriptText),
                generateMindMapData(transcriptText)
            ]);

            // Process mind map data into required format
            const mindMap = {
                nodes: [],
                edges: [],
                layout: 'radial'
            };

            // Function to process nodes recursively
            const processNode = (node, parentId = null, level = 0) => {
                const nodeId = `node-${mindMap.nodes.length + 1}`;
                const nodeType = level === 0 ? 'root' : level === 1 ? 'main' : 'sub';
                const xOffset = level * 200;
                const yOffset = mindMap.nodes.filter(n => n.position.y === level * 100).length * 100;

                // Add node
                mindMap.nodes.push({
                    id: nodeId,
                    type: nodeType,
                    data: {
                        label: node.name,
                        details: '',
                        color: nodeType === 'root' ? '#4CAF50' : nodeType === 'main' ? '#2196F3' : '#FFC107'
                    },
                    position: {
                        x: 400 + xOffset,
                        y: 300 + yOffset
                    },
                    style: {
                        backgroundColor: nodeType === 'root' ? '#E8F5E9' : nodeType === 'main' ? '#E3F2FD' : '#FFF8E1'
                    }
                });

                // Add edge if there's a parent
                if (parentId) {
                    mindMap.edges.push({
                        id: `edge-${mindMap.edges.length + 1}`,
                        source: parentId,
                        target: nodeId,
                        type: 'smoothstep'
                    });
                }

                // Process children
                if (node.children) {
                    node.children.forEach(child => processNode(child, nodeId, level + 1));
                }
            };

            // Process the mind map data
            processNode(mindMapData);

            const notes = {
                summary,
                transcriptId: transcript._id.toString(),
                keyPoints: transcript.content.map(segment => segment.text).slice(0, 5),
                mindMap,
                tags: [],
                status: 'completed',
                processingProgress: 100
            };

            console.log('Notes generated before saving in database => ', notes);
            
            const newNotes = new Notes({
                videoId,
                ...notes
            });

            await newNotes.save();
            return res.status(201).json(newNotes);
        } catch (error) {
            return res.status(500).json({ message: 'Error generating notes', error });
        }
    }

    async updateNotes(req, res) {
        const { id } = req.params;
        const updates = req.body;
        try {
            const notes = await Notes.findByIdAndUpdate(id, updates, { new: true });
            if (!notes) {
                return res.status(404).json({ message: 'Notes not found' });
            }
            return res.json(notes);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating notes', error });
        }
    }
}

export default new NotesService();
