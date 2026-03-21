import { AuthModel } from './auth.model.js';

export class AuthRepository {
  async createUser(payload) {
    return AuthModel.create(payload);
  }

  async findUserByEmail(email) {
    return AuthModel.findOne({ email }).exec();
  }

  async findUserById(userId) {
    return AuthModel.findById(userId).exec();
  }

  async findUserByRefreshToken(refreshToken) {
    return AuthModel.findOne({ refreshToken }).exec();
  }

  async updateRefreshToken(userId, refreshToken) {
    return AuthModel.findByIdAndUpdate(userId, { refreshToken }, { new: true }).exec();
  }

  async updateUserCharity(userId, charityId) {
    return AuthModel.findByIdAndUpdate(userId, { charityId }, { new: true }).exec();
  }
}
