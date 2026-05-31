import { mockProducts } from '../fixtures/mockProducts.js';

export class MockWireClient {
  async runAction(actionId, params = {}) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const products = mockProducts[actionId] || [];
    const query = String(params.query || params.q || '').toLowerCase();

    return {
      products: products.filter((product) => {
        if (!query) return true;
        return String(product.title || product.name || product.product_name || product.display_name || '').toLowerCase().includes(query.split(' ')[0]);
      }).slice(0, params.limit || params.page_size || params.pageSize || 8)
    };
  }
}

export const mockWireClient = new MockWireClient();
