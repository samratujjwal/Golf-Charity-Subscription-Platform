import jwt from 'jsonwebtoken';
import { ApiError } from './ApiError.js';

const accessTokenExpiry = '15m';
const refreshTokenExpiry = '7d';

function getRequiredSecret(name) {
  const secret = process.env[name];

  if (!secret) {
    throw new ApiError(500, `${name} is not configured`);
  }

  return secret;
}

export function generateAccessToken(payload) {
  return jwt.sign(payload, getRequiredSecret('ACCESS_TOKEN_SECRET'), {
    expiresIn: accessTokenExpiry,
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, getRequiredSecret('REFRESH_TOKEN_SECRET'), {
    expiresIn: refreshTokenExpiry,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getRequiredSecret('ACCESS_TOKEN_SECRET'));
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, getRequiredSecret('REFRESH_TOKEN_SECRET'));
}

export function getRefreshTokenCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
