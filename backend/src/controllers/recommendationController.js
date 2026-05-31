import { getRecommendation } from '../ai/recommendationService.js';
import { asyncHandler } from '../utils/http.js';

export const recommend = asyncHandler(async (req, res) => {
  const recommendation = await getRecommendation(req.body || {});
  res.json({ recommendation });
});

