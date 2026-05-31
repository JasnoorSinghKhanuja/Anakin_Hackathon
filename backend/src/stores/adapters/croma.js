import { createStoreAdapter } from '../adapterFactory.js';

export default createStoreAdapter({
  id: 'croma',
  name: 'Croma',
  category: 'electronics',
  actionId: 'cr_search_products',
  buildParams: ({ query, page = 1, sort = '', pincode }) => ({
    query,
    page,
    sort,
    pincode
  })
});

