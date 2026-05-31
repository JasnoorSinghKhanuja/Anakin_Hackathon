import { createStoreAdapter } from '../adapterFactory.js';

export default createStoreAdapter({
  id: 'amazon',
  name: 'Amazon',
  category: 'electronics',
  actionId: 'am_search_products',
  buildParams: ({ query, page = 1, limit = 8, sort = 'featured' }) => ({
    query,
    page,
    limit,
    sort
  })
});

