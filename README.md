# BuyWise.AI

BuyWise.AI is an AI shopping copilot that searches supported stores through Anakin Wire, normalizes product data, compares total cost and value, and recommends the best place to buy.

## Apps

- `frontend/` - React + Vite + TailwindCSS + shadcn-style UI
- `backend/` - Node.js + Express API with Wire adapters and Gemini recommendations

## Supported Stores

Electronics:

- Amazon
- Flipkart
- Reliance Digital
- Croma
- Vijay Sales

Grocery:

- Blinkit
- JioMart
- BigBasket

## Local Setup

Install dependencies:

```bash
npm install --prefix backend
npm install --prefix frontend
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in:

- `ANAKIN_WIRE_API_KEY` for Anakin Wire
- `GEMINI_API_KEY` for Gemini
- `VITE_API_BASE_URL` for the frontend API URL

Run both apps in separate terminals:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Mock Mode

Real Wire and Gemini integrations are the default. For local UI demos without API keys:

```bash
MOCK_MODE=true npm run dev --prefix backend
```

On Windows PowerShell:

```powershell
$env:MOCK_MODE="true"; npm run dev --prefix backend
```

## API

### `GET /api/health`

Returns service health and mode.

### `GET /api/stores`

Returns the supported store registry.

### `POST /api/search/electronics`

Searches Amazon, Flipkart, Reliance Digital, Croma, and Vijay Sales in parallel.

```json
{
  "query": "iPhone 15",
  "pincode": "560001",
  "page": 1,
  "limit": 8
}
```

### `POST /api/search/grocery`

Searches Blinkit, JioMart, and BigBasket in parallel.

```json
{
  "query": "bread milk eggs atta",
  "pincode": "560001",
  "page": 1,
  "limit": 8
}
```

### `POST /api/recommendation`

Generates a strict JSON recommendation from normalized results only.

```json
{
  "mode": "electronics",
  "query": "iPhone 15",
  "results": {}
}
```

## Backend Response Shape

Search responses return:

- `query`
- `mode`
- `stores` grouped by store
- `products` flattened and sorted by effective price, then rating
- `summary` deterministic comparison metrics
- `errors` per-store failures

The normalized product shape is:

```json
{
  "storeId": "amazon",
  "storeName": "Amazon",
  "category": "electronics",
  "title": "Product title",
  "price": 79999,
  "mrp": 89999,
  "effectivePrice": 77999,
  "currency": "INR",
  "rating": 4.4,
  "reviews": 1200,
  "imageUrl": "https://...",
  "productUrl": "https://...",
  "availability": "in stock",
  "deliveryText": "Tomorrow",
  "offers": ["Bank offer"],
  "rawId": "listing-id",
  "rawMeta": {}
}
```

## Deployment

### Backend on Render

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `ANAKIN_WIRE_API_KEY`
  - `GEMINI_API_KEY`
  - `FRONTEND_ORIGIN`
  - `MOCK_MODE=false`

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_BASE_URL=https://your-render-service.onrender.com`

## Adding Stores

Add a new adapter under `backend/src/stores/adapters/`, export it in `backend/src/stores/registry.js`, and implement:

- `id`
- `name`
- `category`
- `actionId`
- `search(input, context)`

The search service automatically runs compatible adapters in parallel and preserves partial results if one store fails.

