import amazon from './adapters/amazon.js';
import flipkart from './adapters/flipkart.js';
import relianceDigital from './adapters/relianceDigital.js';
import croma from './adapters/croma.js';
import blinkit from './adapters/blinkit.js';
import jioMart from './adapters/jioMart.js';
import bigBasket from './adapters/bigBasket.js';

export const storeRegistry = [
  amazon,
  flipkart,
  relianceDigital,
  //croma,
  blinkit,
  jioMart,
  bigBasket
];

export function getStoresByCategory(category) {
  return storeRegistry.filter((store) => store.category === category);
}

export function getPublicStores() {
  return storeRegistry.map(({ id, name, category, actionId }) => ({
    id,
    name,
    category,
    actionId
  }));
}

