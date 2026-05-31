import { createStoreAdapter } from '../adapterFactory.js';

export default createStoreAdapter({
  id: 'flipkart',
  name: 'Flipkart',
  category: 'electronics',
  actionId: 'fk_search_products',
  buildParams: ({ query, pincode }) => ({
    query,
    pincode
  })
});

