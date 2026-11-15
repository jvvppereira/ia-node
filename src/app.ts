import express from "express";
import { generateProducts } from "./openai";

const app = express();
app.use(express.json());

app.post("/api/generate", async (req, res) => {
    try {
        const products = await generateProducts(req.body.message);
        res.json(products);
    } catch (error) {
        console.error("Error generating completion:", error);
        res.status(500).json({ error: "Error generating completion" });
        return;
    }
});

export default app;