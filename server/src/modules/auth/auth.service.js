import { ApiError } from '../../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/token.js';

export class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async registerUser(payload) {
    const { name, email, password } = payload;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      throw new ApiError(400, 'Name must be at least 2 characters long');
    }

    if (!this.isValidEmail(normalizedEmail)) {
      throw new ApiError(400, 'Please provide a valid email address');
    }

    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    const existingUser = await this.authRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new ApiError(409, 'User already exists with this email');
    }

    const user = await this.authRepository.createUser({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: 'user',
    });

    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful',
    };
  }

  async loginUser(payload) {
    const { email, password } = payload;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.authRepository.findUserByEmail(normalizedEmail);

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.isBlocked) {
      throw new ApiError(403, 'This account has been blocked. Please contact support.');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await this.authRepository.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async logoutUser(userId) {
    if (!userId) {
      throw new ApiError(400, 'User id is required');
    }

    await this.authRepository.updateRefreshToken(userId, null);

    return {
      message: 'Logout successful',
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    const decodedToken = verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findUserByRefreshToken(refreshToken);

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (user.isBlocked) {
      throw new ApiError(403, 'This account has been blocked. Please contact support.');
    }

    if (user._id.toString() !== decodedToken.userId) {
      throw new ApiError(401, 'Refresh token does not match');
    }

    return {
      accessToken: generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
      }),
      user: this.sanitizeUser(user),
    };
  }

  async getCurrentUser(userId) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isBlocked) {
      throw new ApiError(403, 'This account has been blocked. Please contact support.');
    }

    return this.sanitizeUser(user);
  }

  sanitizeUser(userDocument) {
    return {
      id: userDocument._id.toString(),
      name: userDocument.name,
      email: userDocument.email,
      role: userDocument.role,
      isBlocked: Boolean(userDocument.isBlocked),
      charityId: userDocument.charityId ? userDocument.charityId.toString() : null,
      createdAt: userDocument.createdAt,
      updatedAt: userDocument.updatedAt,
    };
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
