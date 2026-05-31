import { createStoreAdapter } from '../adapterFactory.js';

export default createStoreAdapter({
  id: 'reliance-digital',
  name: 'Reliance Digital',
  category: 'electronics',
  actionId: 'rd_search_products',
  buildParams: ({ query, page = 1, limit = 8 }) => ({
    query,
    page,
    page_size: limit
  })
});

