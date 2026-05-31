import { env } from '../config/env.js';

export async function classifyProducts(query, products = []) {
  if (!env.gemini.apiKey || products.length === 0) {
    return products;
  }

  const titles = products.map((p, i) => ({
    index: i,
    title: p.title
  }));

  const prompt = `
User searched for: "${query}"

Classify each product.

Categories:
PHONE
LAPTOP
TV
HEADPHONE
CASE
CHARGER
ACCESSORY
OTHER

Return STRICT JSON:

[
  {
    "index": 0,
    "category": "PHONE"
  }
]

Products:
${JSON.stringify(titles)}
`;

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
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  const json = await response.json();

  const text =
    json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) return products;

  try {
    const classifications = JSON.parse(text);

    const wantedCategory =
      inferWantedCategory(query);

    const keepIndexes = classifications
      .filter((c) => c.category === wantedCategory)
      .map((c) => c.index);

    return products.filter((_, idx) =>
      keepIndexes.includes(idx)
    );
  } catch {
    return products;
  }
}

function inferWantedCategory(query) {
  const q = query.toLowerCase();

  if (
    q.includes('iphone') ||
    q.includes('samsung') ||
    q.includes('pixel') ||
    q.includes('mobile')
  ) {
    return 'PHONE';
  }

  if (q.includes('laptop')) {
    return 'LAPTOP';
  }

  if (q.includes('tv')) {
    return 'TV';
  }

  return 'OTHER';
}