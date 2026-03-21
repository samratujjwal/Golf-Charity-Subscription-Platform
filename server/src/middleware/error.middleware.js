import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export function notFoundMiddleware(req, res, next) {
  return next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorMiddleware(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists';
  }

  if (message === 'Origin not allowed by CORS') {
    statusCode = 403;
  }

  logger.error(
    {
      err: error,
      method: req.method,
      path: req.originalUrl,
      statusCode,
    },
    'Request failed',
  );

  const response = ApiResponse.failure(message);

  if (process.env.NODE_ENV !== 'production') {
    response.details = {
      stack: error.stack,
    };
  }

  return res.status(statusCode).json(response);
}
