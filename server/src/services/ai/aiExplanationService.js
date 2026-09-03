import { GoogleGenAI } from "@google/genai";

import { repositoryExplanationPrompt } from "./prompts/repositoryExplanationPrompt.js";

export { generateRepositoryExplanation };

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const responseSchema = {
    type: "object",

    properties: {
        summary: {
            type: "string",
        },

        keyFindings: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                    },

                    severity: {
                        type: "string",
                        enum: ["critical", "warning", "positive"],
                    },

                    explanation: {
                        type: "string",
                    },

                    evidence: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },

                    impact: {
                        type: "string",
                    },

                    recommendation: {
                        type: "string",
                    },
                },

                required: [
                    "title",
                    "severity",
                    "explanation",
                    "evidence",
                    "impact",
                    "recommendation",
                ],
            },
        },

        overallAssessment: {
            type: "string",
        },

        recommendations: {
            type: "array",
            items: {
                type: "string",
            },
        },
    },

    required: [
        "summary",
        "keyFindings",
        "overallAssessment",
        "recommendations",
    ],
};

async function generateRepositoryExplanation(aiContext) {
    if (!aiContext) {
        throw new Error("AI context is required");
    }

    const prompt = `
    ${repositoryExplanationPrompt}

    Repository data:

    ${JSON.stringify(aiContext, null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseSchema,
        },
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response");
    }

    return JSON.parse(response.text);
}