import { env } from '../config/env.js';
import { AppError } from '../utils/http.js';

const FALLBACK_RECOMMENDATION = {
  bestStore: null,
  bestReason: 'No recommendation was generated.',
  bestValueStore: null,
  bestValueReason: 'No value recommendation was generated.',
  cheapestStore: null,
  cheapestReason: 'No cheapest-store recommendation was generated.',
  splitBasketSuggestion: {
    worthIt: false,
    savings: 0,
    reason: 'Split basket analysis is only relevant for grocery searches.'
  },
  summary: 'Search stores to generate a recommendation.'
};

export async function getRecommendation({ mode, query, results }) {
  const compact = compactResults(mode, query, results);

  if (env.mockMode || !env.gemini.apiKey) {
    return deterministicRecommendation(compact);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.gemini.model}:generateContent?key=${env.gemini.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(compact) }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 700
        }
      })
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new AppError(json?.error?.message || 'Gemini recommendation failed.', 502);
  }

  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return deterministicRecommendation(compact);

  try {
    return sanitizeRecommendation(JSON.parse(text));
  } catch {
    return deterministicRecommendation(compact);
  }
}

function buildPrompt(compact) {
  return `You are BuyWise.AI. Recommend where to buy using only this backend-provided JSON. Do not invent stores, prices, products, offers, or delivery times.

Return STRICT JSON with exactly this shape:
{
  "bestStore": "...",
  "bestReason": "...",
  "bestValueStore": "...",
  "bestValueReason": "...",
  "cheapestStore": "...",
  "cheapestReason": "...",
  "splitBasketSuggestion": {
    "worthIt": true,
    "savings": 0,
    "reason": "..."
  },
  "summary": "..."
}

IMPORTANT:

Only compare products with matching specifications.

For phones:
- same model
- same storage
- same variant

Do NOT compare:
128GB vs 256GB
256GB vs 512GB

Do NOT compare:
Renewed vs New

Do NOT compare:
Phone vs Charger
Phone vs Case
Phone vs Cover
Phone vs Adapter
Phone vs Cable

First group products by equivalent specifications.

Then determine:
- cheapest seller
- best value seller
- recommended seller

For grocery, explain whether split delivery is worth it and mention that split deliveries may arrive at different times. If savings are tiny, set worthIt false.

Data:
${JSON.stringify(compact)}`;
}

function compactResults(mode, query, results = {}) {
  const products = (results.products || [])
    .slice(0, 18)
    .map((product) => ({
      storeName: product.storeName,
      title: product.title,
      price: product.price,
      effectivePrice: product.effectivePrice,
      mrp: product.mrp,
      rating: product.rating,
      reviews: product.reviews,
      availability: product.availability,
      deliveryText: product.deliveryText,
      offers: product.offers
    }));

  return {
    mode,
    query,
    products,
    summary: results.summary || null,
    errors: results.errors || []
  };
}

function deterministicRecommendation(compact) {
  const products = compact.products || [];
  if (!products.length) return FALLBACK_RECOMMENDATION;

  const cheapest = [...products].sort((a, b) => (a.effectivePrice || a.price || Infinity) - (b.effectivePrice || b.price || Infinity))[0];
  const bestValue = [...products].sort((a, b) => valueScore(b) - valueScore(a))[0];
  const best = bestValue || cheapest;
  const split = compact.summary?.grocery?.splitBasket || FALLBACK_RECOMMENDATION.splitBasketSuggestion;

  return sanitizeRecommendation({
    bestStore: best.storeName,
    bestReason: `${best.storeName} has the strongest mix of price, rating, availability, and delivery in the returned data.`,
    bestValueStore: bestValue?.storeName || best.storeName,
    bestValueReason: `${bestValue?.storeName || best.storeName} looks like the best value after weighing effective price and rating.`,
    cheapestStore: cheapest.storeName,
    cheapestReason: `${cheapest.storeName} has the lowest effective price found: ₹${cheapest.effectivePrice || cheapest.price}.`,
    splitBasketSuggestion: {
      worthIt: Boolean(split.worthIt),
      savings: Number(split.savings || 0),
      reason: split.reason || 'Split basket is not worth it based on the provided totals.'
    },
    summary: `${best.storeName} is the current BuyWise pick for "${compact.query}" based only on normalized store data.`
  });
}

function valueScore(product) {
  const price = product.effectivePrice || product.price || 1;
  return ((product.rating || 3.5) * 20) / Math.sqrt(price);
}

function sanitizeRecommendation(value = {}) {
  return {
    bestStore: value.bestStore || null,
    bestReason: value.bestReason || FALLBACK_RECOMMENDATION.bestReason,
    bestValueStore: value.bestValueStore || null,
    bestValueReason: value.bestValueReason || FALLBACK_RECOMMENDATION.bestValueReason,
    cheapestStore: value.cheapestStore || null,
    cheapestReason: value.cheapestReason || FALLBACK_RECOMMENDATION.cheapestReason,
    splitBasketSuggestion: {
      worthIt: Boolean(value.splitBasketSuggestion?.worthIt),
      savings: Number(value.splitBasketSuggestion?.savings || 0),
      reason: value.splitBasketSuggestion?.reason || FALLBACK_RECOMMENDATION.splitBasketSuggestion.reason
    },
    summary: value.summary || FALLBACK_RECOMMENDATION.summary
  };
}

