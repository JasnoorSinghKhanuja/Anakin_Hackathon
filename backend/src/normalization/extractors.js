import { asArray, normalizeAvailability, parseInteger, parsePrice, parseRating, pickFirst } from '../utils/parse.js';

const PRODUCT_ARRAY_KEYS = [
  'products',
  'items',
  'results',
  'listings',
  'data',
  'cards',
  'widgets'
];

export function extractProductList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  for (const key of PRODUCT_ARRAY_KEYS) {
    const value = raw[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
      const nested = extractProductList(value);
      if (nested.length) return nested;
    }
  }

  if (raw.data && typeof raw.data === 'object') {
    return extractProductList(raw.data);
  }

  return [];
}

export function extractTitle(item) {
  return pickFirst(item.title, item.name, item.product_name, item.display_name, item.productTitle, item.heading);
}

export function extractPrice(item) {
  return parsePrice(pickFirst(
    item.effective_price,
    item.effectivePrice,
    item.selling_price,
    item.sale_price,
    item.offer_price,
    item.final_price,
    item.discounted_price,
    item.vsp,
    item.price,
    item.current_price
  ));
}

export function extractMrp(item) {
  return parsePrice(pickFirst(item.mrp, item.market_price, item.list_price, item.original_price, item.strike_price));
}

export function extractRating(item) {
  return parseRating(pickFirst(item.rating, item.average_rating, item.star_rating, item.ratings));
}

export function extractReviews(item) {
  return parseInteger(pickFirst(item.reviews, item.review_count, item.ratings_count, item.rating_count, item.num_reviews));
}

export function extractImage(item) {
  const image = pickFirst(
    item.imageUrl,
    item.image_url,
    item.image,
    item.thumbnail,
    item.thumbnail_url,
    item.primary_image,
    Array.isArray(item.images) ? item.images[0] : null
  );

  if (image && typeof image === 'object') {
    return pickFirst(image.url, image.src, image.imageUrl);
  }

  return image;
}

export function extractUrl(item) {
  return pickFirst(item.productUrl, item.product_url, item.url, item.link, item.deeplink, item.web_url);
}

export function extractAvailability(item) {
  return normalizeAvailability(pickFirst(item.availability, item.stock_status, item.stock, item.inventory, item.is_available));
}

export function extractDelivery(item) {
  return pickFirst(item.deliveryText, item.delivery_text, item.delivery, item.delivery_time, item.eta, item.shipping_text);
}

export function extractOffers(item) {
  return [
    ...asArray(item.offers),
    ...asArray(item.offer),
    ...asArray(item.bank_offers),
    ...asArray(item.promotions),
    ...asArray(item.discount)
  ].slice(0, 4);
}

export function extractRawId(item) {
  return pickFirst(item.asin, item.product_id, item.id, item.sku, item.code, item.listing_id, item.item_id);
}

