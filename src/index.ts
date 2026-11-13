import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 15000,
    maxRetries: 0,
});


client.chat.completions
    .create({
        model:"nvidia/nemotron-3-ultra-550b-a55b",
        messages: [
            {
                role: "user",
                "content": "Escreva uma frase sobre Typescript e Node.js",
            },
        ],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 1024,
        stream: false,
    })
    .then((response) => {
        console.log(response.choices[0].message?.content);
    }).catch((error) => {
        console.error("Error:", error);
    });