import { createStoreAdapter } from '../adapterFactory.js';

export default createStoreAdapter({
  id: 'jiomart',
  name: 'JioMart',
  category: 'grocery',
  actionId: 'jm_search_products',
  buildParams: ({ query, category, brand, page = 1, limit = 8, sort = 'relevance' }) => ({
    query,
    category,
    brand,
    page_no: page,
    page_size: limit,
    sort_on: sort
  })
});

