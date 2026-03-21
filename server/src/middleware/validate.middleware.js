import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.body = parsed.body;
      req.params = parsed.params;
      req.query = parsed.query;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new ApiError(400, error.issues.map((issue) => issue.message).join(', ')));
      }

      return next(error);
    }
  };
}
