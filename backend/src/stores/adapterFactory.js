import { env } from '../config/env.js';
import { mockWireClient } from '../wire/mockWireClient.js';
import { wireClient } from '../wire/wireClient.js';
import { extractProductList } from '../normalization/extractors.js';
import { normalizeProduct } from '../normalization/normalizeProduct.js';

export function createStoreAdapter(config) {
  return {
    ...config,
    async search(input, context = {}) {
      const client = context.wireClient || (env.mockMode ? mockWireClient : wireClient);
      const params = config.buildParams(input);
      
      const raw = await client.runAction(config.actionId, params, {
        timeoutMs: context.timeoutMs
      });

      if (config.id === 'flipkart') {
        console.log(JSON.stringify(raw, null, 2));
      }
      if (config.id === 'amazon') {
      console.log(JSON.stringify(raw, null, 2));
      }
      
      const products = extractProductList(raw)
        .map((item) => normalizeProduct(config.mapItem ? config.mapItem(item) : item, config))
        .filter((product) => product.price !== null || product.effectivePrice !== null);

      

      return {
        store: {
          id: config.id,
          name: config.name,
          category: config.category,
          actionId: config.actionId
        },
        rawCount: products.length,
        products
      };
    }
  };
}

