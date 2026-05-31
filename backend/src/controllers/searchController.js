import { asyncHandler } from '../utils/http.js';
import { searchStores } from '../services/searchService.js';
import { getRecommendation } from '../ai/recommendationService.js';

export const searchElectronics = asyncHandler(async (req, res) => {
  const results = await searchStores('electronics', req.body || {});

  const recommendation = await getRecommendation({
    mode: 'electronics',
    query: req.body?.query,
    results
  });

  res.json({
    ...results,
    recommendation
  });
});

export const searchGrocery = asyncHandler(async (req, res) => {
  const results = await searchStores('grocery', req.body || {});

  const recommendation = await getRecommendation({
    mode: 'grocery',
    query: req.body?.query,
    results
  });

  res.json({
    ...results,
    recommendation
  });
});
