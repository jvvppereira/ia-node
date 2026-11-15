
import dotenv from "dotenv";
import { OpenAI } from "openai/client";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { getProductsInventory, getProductsMissingInventory } from "./database";
import { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions/completions.js";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 30000,
    maxRetries: 0,
});

const schema = z.object({
    products: z.array(z.string()),
});

const tools: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "products_inventory",
            description: "Loads the products inventory with inventory greater than 0 from the database",
            parameters: {
                type: "object",
                properties: {},
                additionalProperties: false,
            },
            strict: true
        },
    },
    {
        type: "function",
        function: {
            name: "products_missing_inventory",
            description: "Loads the products with missing inventory from the database",
            parameters: {
                type: "object",
                properties: {},
                additionalProperties: false,
            },
            strict: true
        },
    },
];

async function generateCompletionMessage(messages: ChatCompletionMessageParam[]) {
    const completion = await client.chat.completions
        .parse({
            model: "nvidia/nemotron-3-ultra-550b-a55b",
            max_completion_tokens: 500,
            response_format: zodResponseFormat(schema, "products_schema"),
            tools,
            messages,
            tool_choice: { type: "function", function: { name: "products_inventory" } }
        });
    const message = completion?.choices[0]?.message;
    if (message?.refusal) {
        throw new Error("The model refused to generate a response.");
    }
    return message;
}

export const generateProducts = async (content: string) => {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "developer",
            "content": "List 3 products based on the user's request; Just load products with inventory greater than 0. If the user asks for products with missing inventory, load only products with inventory equal to 0. Return the result in a JSON object with a single key 'products' and an array of product names as the value.",
        },
        {
            role: "user",
            "content": content,
        },
    ]

    const message = await generateCompletionMessage(messages);

    const { tool_calls } = message;

    console.log(`Tool calls: ${JSON.stringify(tool_calls)}`);

    if (tool_calls) {
        const tool_call = tool_calls.find(tc => tc.type === "function");
        if (!tool_call) {
            throw new Error("No function tool call found");
        }
        const fun = tool_call.function;

        const toolsMap: Record<string, (args: unknown) => Promise<unknown> | unknown> = {
            "products_inventory": getProductsInventory,
            "products_missing_inventory": getProductsMissingInventory
        };

        const toolFunction = toolsMap[fun.name];

        if (!toolFunction) {
            throw new Error(`Tool function not found`);
        }
        console.log(`Calling tool function: ${fun.name} with arguments: ${JSON.stringify(fun.parsed_arguments)}`);
        const result = await toolFunction(fun.parsed_arguments);
        messages.push(message);
        messages.push({
            role: "tool",
            tool_call_id: tool_call?.id,
            content: JSON.stringify(result),
        });

        const finalMessage = await generateCompletionMessage(messages);
        return finalMessage?.parsed;
    }

    return message?.parsed;


}