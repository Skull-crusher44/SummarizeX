import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to generate mind map data using OpenAI
export const generateMindMapData = async (text) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a mind map generator. Create a hierarchical mind map structure from the given text. The output should be valid JSON with a root node and child nodes."
                },
                {
                    role: "user",
                    content: `Generate a mind map structure from this text as JSON. Include:
                    1. A root node with the main topic
                    2. Main concept nodes as children
                    3. Supporting details as sub-nodes
                    4. Keep node names concise
                    
                    Text: ${text}
                    
                    Format the response as valid JSON like this example:
                    {
                        "name": "Main Topic",
                        "children": [
                            {
                                "name": "Concept 1",
                                "children": [
                                    { "name": "Detail 1" },
                                    { "name": "Detail 2" }
                                ]
                            },
                            {
                                "name": "Concept 2",
                                "children": [
                                    { "name": "Detail 3" },
                                    { "name": "Detail 4" }
                                ]
                            }
                        ]
                    }`
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("Error generating mind map data:", error);
        throw new Error("Failed to generate mind map data");
    }
};

// Sample prompts for different note-taking styles
export const samplePrompts = [
    {
        id: 1,
        name: "Basic Summary",
        prompt: "Provide a clear and concise summary of the following text:"
    },
    {
        id: 2,
        name: "Cornell Notes Style",
        prompt: "Analyze the text and format it in Cornell Notes style with main ideas, supporting details, and a summary:"
    },
    {
        id: 3,
        name: "Question-Based",
        prompt: "Generate key questions and their answers from the following text:"
    },
    {
        id: 4,
        name: "Mind Map Style",
        prompt: "Create a textual mind map representation of the main concepts and their relationships from the following text:"
    },
    {
        id: 5,
        name: "Academic Analysis",
        prompt: "Provide an academic analysis of the following text, including main arguments, evidence, and conclusions:"
    },
    {
        id: 6,
        name: "Key Points & Examples",
        prompt: "Extract the main points and provide relevant examples from the following text:"
    },
    {
        id: 7,
        name: "Problem-Solution Format",
        prompt: "Identify problems and their solutions discussed in the following text:"
    },
    {
        id: 8,
        name: "Comparative Analysis",
        prompt: "Analyze and compare different viewpoints or concepts presented in the following text:"
    },
    {
        id: 9,
        name: "Executive Summary",
        prompt: "Create a professional executive summary of the following text:"
    },
    {
        id: 10,
        name: "Study Guide Format",
        prompt: "Generate a comprehensive study guide with key terms, concepts, and their explanations from the following text:"
    }
];

// Function to summarize text using OpenAI
export const summarizeText = async (text, promptStyle = null) => {
    try {
        let promptText;
        if (promptStyle && typeof promptStyle === 'string') {
            // If custom prompt is provided
            promptText = promptStyle;
        } else if (promptStyle && typeof promptStyle === 'number') {
            // If sample prompt ID is provided
            const selectedPrompt = samplePrompts.find(p => p.id === promptStyle);
            promptText = selectedPrompt ? selectedPrompt.prompt : samplePrompts[0].prompt;
        } else {
            // Default to basic summary
            promptText = samplePrompts[0].prompt;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `${promptText}\n\n${text}`,
                },
            ],
            max_tokens: 500, // Increased token limit for more detailed responses
            temperature: 0.7,
        });
        console.log('chat gpt response   => ', response);

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error summarizing text:", error);
        throw new Error("Failed to summarize text");
    }
};
