export const env = {
  port: Number(process.env.PORT || 8080),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  mockMode: process.env.MOCK_MODE === 'true',
  wire: {
    apiKey: process.env.ANAKIN_WIRE_API_KEY || '',
    baseUrl: process.env.ANAKIN_WIRE_BASE_URL || 'https://anakin.io/v1/wire',
    pollIntervalMs: Number(process.env.WIRE_POLL_INTERVAL_MS || 1200),
    timeoutMs: Number(process.env.WIRE_TIMEOUT_MS || 30000),
    maxRetries: Number(process.env.WIRE_MAX_RETRIES || 2)
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
  }
};

