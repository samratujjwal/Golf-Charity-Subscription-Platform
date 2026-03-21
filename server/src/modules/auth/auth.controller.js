import { ApiResponse } from '../../utils/ApiResponse.js';
import { getRefreshTokenCookieOptions } from '../../utils/token.js';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const result = await this.authService.registerUser(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authService.loginUser(req.body);

      res.cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions());

      return res.status(200).json(
        ApiResponse.success({
          user: result.user,
          accessToken: result.accessToken,
        }),
      );
    } catch (error) {
      return next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const result = await this.authService.logoutUser(req.user.userId);

      res.clearCookie('refreshToken', getRefreshTokenCookieOptions());

      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const result = await this.authService.refreshAccessToken(refreshToken);

      return res.status(200).json(
        ApiResponse.success({
          accessToken: result.accessToken,
          user: result.user,
        }),
      );
    } catch (error) {
      return next(error);
    }
  };

  me = async (req, res, next) => {
    try {
      const result = await this.authService.getCurrentUser(req.user.userId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
