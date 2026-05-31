import { createStoreAdapter } from '../adapterFactory.js';

export default createStoreAdapter({
  id: 'blinkit',
  name: 'Blinkit',
  category: 'grocery',
  actionId: 'act_blinkit_post_layout_search',
  buildParams: ({ query, page = 1 }) => ({
    q: query,
    search_type: 'type_to_search',
    search_page: 'initial'
  })
});

