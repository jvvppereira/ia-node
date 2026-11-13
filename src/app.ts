import dotenv from "dotenv";
import express from "express";
import { OpenAI } from "openai/client";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

dotenv.config();

const app = express();
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 30000,
    maxRetries: 0,
});

const schema = z.object({
    products: z.array(z.string()),
});

app.post("/api/generate", async (req, res) => {
    try {
        const completion = await client.chat.completions
            .parse({
                model: "nvidia/nemotron-3-ultra-550b-a55b",
                max_completion_tokens: 500,
                response_format: zodResponseFormat(schema, "products_schema"),
                messages: [
                    {
                        role: "developer",
                        "content": "List 3 products based on the user's request",
                    },
                    {
                        role: "user",
                        "content": req.body.message,
                    },
                ],
            });
        res.json(completion?.choices[0]?.message?.parsed?.products);
    } catch (error) {
        console.error("Error generating completion:", error);
        res.status(500).json({ error: "Error generating completion" });
        return;
    }
});

export default app;