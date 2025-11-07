import { GoogleGenAI } from "@google/genai";

export const generate360HomeImage = async (
    prompt: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please ensure it is configured.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        // Prepend instructions for a 360-degree panoramic view to the user's prompt
        const fullPrompt = `A 360-degree, equirectangular, photorealistic, panoramic interior view of: ${prompt}`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9', // Equirectangular images are often in 2:1, but 16:9 is a supported fallback
            },
        });

        const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;

        if (!base64ImageBytes) {
            throw new Error("Image generation succeeded, but no image data was returned.");
        }

        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (err: any) {
        console.error("Error in generate360HomeImage:", err);
        throw new Error(err.message || "An unexpected error occurred during image generation.");
    }
};