import { createStoreAdapter } from '../adapterFactory.js';

export default createStoreAdapter({
  id: 'vijay-sales',
  name: 'Vijay Sales',
  category: 'electronics',
  actionId: 'vs_search_products',
  buildParams: ({ query, page = 1, limit = 8 }) => ({
    query,
    page_size: limit,
    page
  })
});

