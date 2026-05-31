const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json?.error?.message || 'BuyWise could not complete the request.');
  }

  return json;
}

export function searchProducts(mode, payload) {
  return request(`/api/search/${mode}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getRecommendation(payload) {
  return request('/api/recommendation', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getStores() {
  return request('/api/stores');
}

