import { getStoresByCategory } from '../stores/registry.js';
import { sortProducts } from '../normalization/normalizeProduct.js';
import { buildComparison } from './comparisonService.js';
import { AppError } from '../utils/http.js';
import { classifyProducts } from '../ai/productClassifier.js';

export async function searchStores(mode, input) {
  if (!input.query || typeof input.query !== 'string') {
    throw new AppError('A search query is required.', 400);
  }

  const stores = getStoresByCategory(mode);
    
  const settled = await Promise.allSettled(
    stores.map((store) => store.search({
      query: input.query.trim(),
      pincode: input.pincode,
      category: input.category,
      brand: input.brand,
      page: input.page || 1,
      limit: input.limit || 8,
      sort: input.sort
    }))
  );

  const grouped = {};
  const errors = [];

  settled.forEach((result, index) => {
    const store = stores[index];

    if (result.status === 'fulfilled') {
      grouped[store.id] = result.value;
      return;
    }

    grouped[store.id] = {
      store: {
        id: store.id,
        name: store.name,
        category: store.category,
        actionId: store.actionId
      },
      rawCount: 0,
      products: [],
      error: result.reason?.message || 'Store search failed.'
    };
    errors.push({
      storeId: store.id,
      storeName: store.name,
      message: result.reason?.message || 'Store search failed.'
    });
  });

  let products = sortProducts(
    Object.values(grouped)
      .flatMap((storeResult) => storeResult.products || [])
  );

  products = await classifyProducts(
    input.query,
    products
  );

  

  products = filterProducts(products);

  if (
    input.query.trim().toLowerCase() === 'iphone 17'
  ) {
    products = products.filter((p) => {
      const t = p.title.toLowerCase();

      return (
        
        !t.includes('case') &&
        !t.includes('cover') &&
        !t.includes('adapter') &&
        !t.includes('charger') &&
        !t.includes('magsafe') &&
        !t.includes('17e') &&
        !t.includes('iphone 16') &&
        !t.includes('iphone 15')
      );
    });
  }
  
  
  //products = products.slice(0, 10);
  for (const storeResult of Object.values(grouped)) {
    storeResult.products = (storeResult.products || []).filter((product) =>
      products.some(
        (p) =>
          p.storeId === product.storeId &&
          p.title === product.title
      )
    );
  }


  return {
    query: input.query.trim(),
    mode,
    stores: grouped,
    products,
    summary: buildComparison(mode, products, grouped),
    errors
  };
}


function filterProducts(products) {
  const BAD_WORDS = [
    'case',
    'cover',
    'adapter',
    'charger',
    'cable',
    'magsafe',
    'screen guard',
    'tempered',
    'protector',
    'skin',
    //'renewed',
    //'refurbished',
    'used',
    'pre-owned'
  ];


  return products.filter((product) => {
    const title = String(product.title || '').toLowerCase();

    return !BAD_WORDS.some((word) =>
      title.includes(word)
    );
  });
}