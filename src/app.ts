import dotenv from "dotenv";
import express from "express";
import { OpenAI } from "openai/client";
import { z } from "zod";

dotenv.config();

const app = express();
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 30000,
    maxRetries: 0,
});

app.post("/api/generate", async (req, res) => {
    const completion = await client.chat.completions
        .create({
            model: "nvidia/nemotron-3-ultra-550b-a55b",
            max_completion_tokens: 500,
            response_format: { type: "json_object" },
            // @ts-expect-error
            chat_template_kwargs: { enable_thinking: false },
            messages: [
                {
                    role: "developer",
                    "content": "List 3 products based on the user's request; Response with a JSON object following the format: { products: string[] }",
                },
                {
                    role: "user",
                    "content": req.body.message,
                },
            ],
        });

    if (completion) {
        const content = completion?.choices[0]?.message?.content;
        if (!content) {
            return res.status(500).json({ error: "Empty response from model:" + JSON.stringify(completion) });
        }

        let output;
        try {
            output = JSON.parse(content);
        } catch (parseError) {
            console.error("JSON inválido retornado pelo modelo:", content);
            return res.status(500).json({ error: "Model returned an invalid JSON" });
        }

        const schema = z.object({
            products: z.array(z.string()),
        });

        const validation = schema.safeParse(output);

        if (!validation.success) {
            res.status(500).json({ error: "Invalid response format" });
            return;
        }
        res.json(validation.data);
    } else {
        console.error("No response from model", completion);
        res.status(500).json({ error: "No response from model" });
    }
});

export default app;