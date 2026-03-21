import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/token.js';
import { AuthRepository } from '../modules/auth/auth.repository.js';

const authRepository = new AuthRepository();

export async function verifyJWT(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token is required');
    }

    const token = authorizationHeader.split(' ')[1];
    const decodedToken = verifyAccessToken(token);
    const user = await authRepository.findUserById(decodedToken.userId);

    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    if (user.isBlocked) {
      throw new ApiError(403, 'This account has been blocked. Please contact support.');
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      isBlocked: Boolean(user.isBlocked),
    };

    return next();
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }

    return next(error);
  }
}

export function authorizeRoles(...roles) {
  return async (req, res, next) => {
    if (!req.user?.role) {
      return next(new ApiError(401, 'Unauthorized request'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to access this resource'));
    }

    return next();
  };
}

export const adminOnly = authorizeRoles('admin');
