import pinoHttp from 'pino-http';
import { logger } from '../config/logger.js';

export const requestLogger = pinoHttp({
  logger,
  autoLogging: true,
  serializers: {
    req(request) {
      return {
        id: request.id,
        method: request.method,
        url: request.url,
      };
    },
  },
});
