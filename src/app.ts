import dotenv from "dotenv";
import express from "express";
import { OpenAI } from "openai/client";

dotenv.config();

const app = express();
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 15000,
    maxRetries: 0,
});

app.post("/api/generate", async (req, res) => {
    client.chat.completions
        .create({
            model: "nvidia/nemotron-3-ultra-550b-a55b",
            max_completion_tokens: 100,
            messages: [
                {
                    role: "developer",
                    "content": "You are an assistant that generate responses in one sentence; Use emojis in the response and write in Portuguese",
                },
                {
                    role: "user",
                    "content": req.body.message,
                },
            ],
        })
        .then((response) => {
            res.json({ content: response.choices[0].message?.content });
        }).catch((error) => {
            res.status(500).json({ error: "Error:" + error });
        });
});

export default app;