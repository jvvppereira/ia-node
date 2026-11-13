import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 15000,
    maxRetries: 0,
});

async function generateText() {
    client.chat.completions
        .create({
            model: "nvidia/nemotron-3-ultra-550b-a55b",
            max_completion_tokens: 100,
            messages: [
                {
                    role: "developer",
                    "content": "Use emojis in the response and write in Portuguese",
                },
                {
                    role: "user",
                    "content": "Escreva uma frase sobre Typescript e Node.js",
                },
            ],
        })
        .then((response) => {
            console.log(response.choices[0].message?.content);
        }).catch((error) => {
            console.error("Error:", error);
        });
}

generateText();