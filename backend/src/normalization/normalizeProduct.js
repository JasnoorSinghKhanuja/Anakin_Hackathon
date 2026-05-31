import { compactObject, inferCurrency, parsePrice } from '../utils/parse.js';
import {
  extractAvailability,
  extractDelivery,
  extractImage,
  extractMrp,
  extractOffers,
  extractPrice,
  extractRating,
  extractRawId,
  extractReviews,
  extractTitle,
  extractUrl
} from './extractors.js';

export function normalizeProduct(item, store) {
  const price = extractPrice(item);
  const mrp = extractMrp(item);

  const currency =
    item.currency ||
    item.currency_code ||
    item.currencyCode;

  let normalizedPrice = price;
  let normalizedMrp = mrp;

  const USD_TO_INR = 96;

  if (currency === 'USD') {
    normalizedPrice = price ? Math.round(price * USD_TO_INR) : price;
    normalizedMrp = mrp ? Math.round(mrp * USD_TO_INR) : mrp;
  }

  const offers = extractOffers(item);
  const offerDiscounts = offers
    .map((offer) => estimateOfferDiscount(offer, price))
    .filter((value) => value !== null && value > 0);
  const bestOfferDiscount = offerDiscounts.length ? Math.max(...offerDiscounts) : 0;
  const effectivePrice = normalizedPrice !== null ? Math.max(0, normalizedPrice - bestOfferDiscount) : null;

  return {
    storeId: store.id,
    storeName: store.name,
    category: store.category,
    title: extractTitle(item) || 'Untitled product',
    price: normalizedPrice,
    mrp: normalizedMrp,
    effectivePrice: effectivePrice ?? price,
    currency: inferCurrency(item.price, item.mrp, item.selling_price),
    rating: extractRating(item),
    reviews: extractReviews(item),
    imageUrl: extractImage(item),
    productUrl: extractUrl(item),
    availability: extractAvailability(item),
    deliveryText: extractDelivery(item),
    offers,
    rawId: extractRawId(item),
    rawMeta: compactObject({
      brand: item.brand,
      variant: item.variant,
      seller: item.seller,
      category: item.category,
      jobSource: item.source
    })
  };
}

function estimateOfferDiscount(offer, price) {
  if (!offer || !price) return null;

  const text = String(offer).toLowerCase();
  const isInformational = ['cashback', 'wallet', 'exchange', 'emi', 'pickup', 'free delivery'].some((word) => text.includes(word));
  const isDiscount = ['discount', 'off', 'instant'].some((word) => text.includes(word));

  if (isInformational || !isDiscount) return null;

  const percent = text.match(/(\d+(\.\d+)?)\s*%/);
  if (percent) {
    return Math.round(price * (Number(percent[1]) / 100));
  }

  const amount = parsePrice(text);
  return amount && amount < price ? amount : null;
}

export function sortProducts(products) {
  return [...products].sort((a, b) => {
    const aPrice = a.effectivePrice ?? a.price ?? Number.MAX_SAFE_INTEGER;
    const bPrice = b.effectivePrice ?? b.price ?? Number.MAX_SAFE_INTEGER;
    if (aPrice !== bPrice) return aPrice - bPrice;
    return (b.rating || 0) - (a.rating || 0);
  });
}
