
import { OpenAI } from "openai";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Initialize OpenAI API
export async function createTranscript(audioPath) {
    try {
        console.log("inside transcription api call");
        
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
            });
            // Validate input
            const newAudioPath = audioPath.replace(/\\/g, "/")
            console.log(newAudioPath);
            const models = await openai.models.list();
        console.log("Connected to OpenAI successfully!");

        if (!newAudioPath) {
            throw new Error('Audio path is required');
            }
            
            // Check if file exists
            if (!fs.existsSync(newAudioPath)) {
                throw new Error(`File not found: ${newAudioPath}`);
                }
                
                
                
                // Create read stream
                const audioStream = fs.createReadStream(newAudioPath);
                
        
                // Generate transcript
                const response = await openai.audio.transcriptions.create({
                    file: audioStream,
                    model: "whisper-1",
            response_format: "json",
            language: "en" // You can make this configurable if needed
            });

        // Close the stream
        audioStream.destroy();
        
        if (!response || !response.text) {
            throw new Error('No transcript generated');
            }
            return response.text;
            
            } catch (error) {
                console.error("Error creating transcript:", error);
                throw new Error(`Failed to create transcript: ${error.message}`);
                }
                }
        
            
               //test function to call the createTranscript function
               // (async () => {
                //     const path = "harvard.wav"
                //     const data = await createTranscript(path);
                //     console.log(data);
                
                // })
                
                
                
// import fs from 'fs';
// import { pipeline } from '@xenova/transformers';
// import WaveFile from 'wavefile';

// const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-large-v2');

// export async function createTranscript(audioPath) {
//     try {
//         console.log('Inside transcription API call');

//         // Validate input
//         if (!audioPath) throw new Error('Audio path is required');
//         const newAudioPath = audioPath.replace(/\\/g, "/");

//         // Ensure the file exists
//         if (!fs.existsSync(newAudioPath)) {
//             throw new Error('Audio file not found');
//         }

//         // Read .wav file
//         const audioBuffer = fs.readFileSync(newAudioPath);
//         let wav = new WaveFile(audioBuffer);

//         // Convert to required format
//         wav.toBitDepth('32f');  // Convert to 32-bit float PCM
//         wav.toSampleRate(16000); // Convert sample rate to 16kHz

//         let audioData = wav.getSamples();
//         if (Array.isArray(audioData) && audioData.length > 1) {
//             // Merge stereo to mono correctly
//             audioData = Float32Array.from(audioData[0].map((sample, i) => (sample + audioData[1][i]) / 2));
//         }

//         // Perform transcription
//         const response = await transcriber(audioData);
//         if (!response || !response.text) {
//             throw new Error('No transcript generated');
//         }

//         console.log(response.text);
//         return response.text;

//     } catch (error) {
//         console.error("Error creating transcript:", error.message);
//         return null;
//     }
// }
                
                
// //test function to call the createTranscript function
// // (async () => {
// //     const path = "./harvard.wav"
// //     const data = await createTranscript("./harvard.wav");
// //     console.log(data);
// // })





