# IA Node - Product Recommendation API

A Node.js/TypeScript REST API that uses NVIDIA's Nemotron-3-Ultra LLM to recommend products based on user requests and inventory availability.

## Features

- **AI-powered recommendations** - Uses NVIDIA Nemotron-3-Ultra via OpenAI-compatible API
- **Inventory-aware** - Filters products by stock availability (in stock or out of stock)
- **Function calling** - Leverages OpenAI function calling to query inventory database
- **Structured output** - Returns validated JSON using Zod schemas

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI**: NVIDIA Nemotron-3-Ultra (via OpenAI SDK)
- **Validation**: Zod
- **Development**: tsx for hot-reloading

## Project Structure

```
src/
├── index.ts        # Entry point - starts Express server
├── app.ts          # Express app with /api/generate endpoint
├── openai.ts       # OpenAI client & product generation logic
└── database.ts     # In-memory product inventory
```

## API Endpoint

### POST `/api/generate`

Generates product recommendations based on user message.

**Request:**
```json
{
  "message": "I need breakfast items"
}
```

**Response:**
```json
{
  "products": ["Honey", "Coffee", "Eggs"]
}
```

The AI will:
- Return products with **inventory > 0** by default
- Return products with **inventory = 0** if user asks for "missing inventory" or "out of stock"

## Setup

### Prerequisites

- Node.js 18+
- NVIDIA API key (from [NVIDIA NGC](https://ngc.nvidia.com/))

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file:

```env
NVIDIA_API_KEY=your_nvidia_api_key_here
PORT=3000  # optional, defaults to 3000
```

### Running

```bash
# Development with hot reload
npm run dev
```

Server starts at `http://localhost:3000`

## Product Database

The in-memory database contains:

| Product | Inventory |
|---------|-----------|
| Honey   | 10        |
| Coffee  | 5         |
| Bread   | 0         |
| Milk    | 0         |
| Eggs    | 12        |
| Cheese  | 3         |
| Butter  | 0         |

## Example Usage

```bash
# Get available products for breakfast
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "What can I make for breakfast?"}'

# Get out-of-stock products
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "What products are out of stock?"}'
```

## License

ISC