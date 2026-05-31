import { sortProducts } from '../normalization/normalizeProduct.js';

export function buildComparison(mode, products, groupedStores) {
  const sorted = sortProducts(products);
  const inStock = sorted.filter((product) => product.availability !== 'out of stock');
  const cheapest = inStock[0] || sorted[0] || null;
  const bestValue = findBestValue(inStock.length ? inStock : sorted);
  const fastest = findFastest(inStock.length ? inStock : sorted);
  const grocery = mode === 'grocery' ? buildGrocerySummary(groupedStores) : null;

  return {
    cheapest,
    bestValue,
    fastest,
    grocery
  };
}

function findBestValue(products) {
  if (!products.length) return null;

  return [...products].sort((a, b) => {
    const aScore = valueScore(a);
    const bScore = valueScore(b);
    return bScore - aScore;
  })[0];
}

function findFastest(products) {
  if (!products.length) return null;

  return [...products].sort((a, b) => deliveryRank(a.deliveryText) - deliveryRank(b.deliveryText))[0];
}

function valueScore(product) {
  const price = product.effectivePrice || product.price || 1;
  const rating = product.rating || 3.5;
  const reviewBoost = Math.log10((product.reviews || 0) + 10);
  const discount = product.mrp && price ? Math.max(0, (product.mrp - price) / product.mrp) : 0;
  return (rating * 20 + reviewBoost * 6 + discount * 18) / Math.sqrt(price);
}

function deliveryRank(text = '') {
  const value = String(text).toLowerCase();
  if (!value) return 99;
  if (value.includes('minute') || value.includes('10') || value.includes('15')) return 1;
  if (value.includes('today') || value.includes('pickup')) return 2;
  if (value.includes('tomorrow') || value.includes('1 day')) return 3;
  if (value.includes('2')) return 4;
  return 50;
}

function buildGrocerySummary(groupedStores) {
  const storeTotals = Object.values(groupedStores)
    .map((storeResult) => {
      const products = storeResult.products || [];
      const total = products.reduce((sum, product) => sum + (product.effectivePrice || product.price || 0), 0);
      return {
        storeId: storeResult.store.id,
        storeName: storeResult.store.name,
        total,
        itemCount: products.length,
        deliveryText: products[0]?.deliveryText || null,
        products
      };
    })
    .filter((store) => store.total > 0)
    .sort((a, b) => a.total - b.total);

  const cheapestSingleStore = storeTotals[0] || null;
  const split = buildSplitBasket(storeTotals, cheapestSingleStore);

  return {
    storeTotals,
    cheapestSingleStore,
    splitBasket: split
  };
}

function buildSplitBasket(storeTotals, cheapestSingleStore) {
  if (!cheapestSingleStore || storeTotals.length < 2) {
    return {
      worthIt: false,
      savings: 0,
      reason: 'Not enough comparable stores to suggest a split basket.',
      items: []
    };
  }

  const productsByTitle = new Map();
  for (const store of storeTotals) {
    for (const product of store.products) {
      const key = normalizeBasketKey(product.title);
      const current = productsByTitle.get(key);
      if (!current || (product.effectivePrice || product.price || Infinity) < (current.effectivePrice || current.price || Infinity)) {
        productsByTitle.set(key, product);
      }
    }
  }

  const splitItems = [...productsByTitle.values()];
  const splitTotal = splitItems.reduce((sum, product) => sum + (product.effectivePrice || product.price || 0), 0);
  const savings = Math.max(0, Math.round(cheapestSingleStore.total - splitTotal));
  const worthIt = savings >= Math.max(40, cheapestSingleStore.total * 0.08);

  return {
    worthIt,
    savings,
    splitTotal,
    reason: worthIt
      ? 'Split delivery may save enough to consider, but items can arrive at different times.'
      : 'Savings are too small to justify split deliveries for this basket.',
    items: splitItems.map((product) => ({
      title: product.title,
      storeName: product.storeName,
      effectivePrice: product.effectivePrice || product.price,
      deliveryText: product.deliveryText
    }))
  };
}

function normalizeBasketKey(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .slice(0, 4)
    .join(' ');
}

