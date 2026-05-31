export class AppError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.originalUrl
    }
  });
}

export function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const message = status >= 500 ? 'Something went wrong while processing the request.' : error.message;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      message,
      details: error.details || null
    }
  });
}

