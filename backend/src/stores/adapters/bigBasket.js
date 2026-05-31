import { createStoreAdapter } from '../adapterFactory.js';

export default createStoreAdapter({
  id: 'bigbasket',
  name: 'BigBasket',
  category: 'grocery',
  actionId: 'bb_search_products',
  buildParams: ({ query, category, brand, page = 1 }) => ({
    query,
    category,
    brand,
    page
  })
});

