import { getPublicStores } from '../stores/registry.js';
import { asyncHandler } from '../utils/http.js';

export const listStores = asyncHandler(async (req, res) => {
  res.json({ stores: getPublicStores() });
});

