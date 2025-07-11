/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserDocument } from '../schemas/user.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

interface MockModel<T> extends Partial<Model<T>> {
  find: jest.Mock;
  findById: jest.Mock;
  findOne: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  exec: jest.Mock;
  lean: jest.Mock;
  updateOne: jest.Mock;
  deleteMany: jest.Mock;
}

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-refresh-token-uuid'),
}));

const mockUserId = new Types.ObjectId();
const mockUser = {
  _id: mockUserId,
  username: 'testuser',
  email: 'test@example.com',
  displayName: 'Test User',
  password: 'hashedPassword123',
  workspaces: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRefreshToken = {
  _id: new Types.ObjectId(),
  token: 'mock-refresh-token-uuid',
  userId: mockUserId.toString(),
  expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userModel: MockModel<UserDocument>;
  let refreshTokenModel: MockModel<RefreshToken>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            lean: jest.fn(),
            updateOne: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            lean: jest.fn(),
            updateOne: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-access-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<MockModel<UserDocument>>(getModelToken(User.name));
    refreshTokenModel = module.get<MockModel<RefreshToken>>(getModelToken(RefreshToken.name));
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('signup', () => {
    const signupData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    };

    it('should create a new user successfully', async () => {
      // Mock userModel.findOne to return null (no existing user)
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      // Mock bcrypt.hash
      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      // Mock userModel.create
      userModel.create.mockResolvedValue(mockUser);

      const result = await service.signup(signupData);

      expect(result.success).toBe(true);
      expect(result.status).toBe(201);
      expect(result.data?.userId).toBe(mockUserId.toString());
      expect(result.message).toBe('User registered successfully');
      expect(userModel.findOne).toHaveBeenCalledTimes(2); // Once for email, once for username
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userModel.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: 'Test User',
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      await expect(service.signup(signupData)).rejects.toThrow(
        new BadRequestException('Email or Username already exists'),
      );

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should throw BadRequestException if username already exists', async () => {
      // First call returns null (email doesn't exist), second call returns user (username exists)
      userModel.findOne
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUser) });

      await expect(service.signup(signupData)).rejects.toThrow(
        new BadRequestException('Email or Username already exists'),
      );

      expect(userModel.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw error if bcrypt.hash fails', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      (mockBcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

      await expect(service.signup(signupData)).rejects.toThrow('Hash error');
    });

    it('should throw error if userModel.create fails', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      userModel.create.mockRejectedValue(new Error('Database error'));

      await expect(service.signup(signupData)).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    const loginData = {
      usernameOrEmail: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with email', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      mockBcrypt.compare.mockResolvedValue(true as never);
      refreshTokenModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.login(loginData);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data?.userId).toBe(mockUserId.toString());
      expect(result.data?.accessToken).toBe('mock-access-token');
      expect(result.data?.refreshToken).toBe('mock-refresh-token-uuid');
      expect(result.message).toBe('Login successful');
      expect(userModel.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'test@example.com' }, { username: 'test@example.com' }],
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
    });

    it('should login successfully with username', async () => {
      const loginDataWithUsername = {
        usernameOrEmail: 'testuser',
        password: 'password123',
      };

      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      mockBcrypt.compare.mockResolvedValue(true as never);
      refreshTokenModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.login(loginDataWithUsername);

      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe(mockUserId.toString());
    });

    it('should throw BadRequestException if user not found', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.login(loginData)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
    });

    it('should throw BadRequestException if password is invalid', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginData)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
    });

    /*
    it('should throw error if userModel.findOne fails', async () => {
      userModel.findOne.mockRejectedValue(new Error('Database error'));
      await expect(service.login(loginData)).rejects.toThrow('Database error');
    });
*/
    it('should throw error if bcrypt.compare fails', async () => {
      userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });
      (mockBcrypt.compare as jest.Mock).mockRejectedValue(new Error('Compare error'));

      return await expect(service.login(loginData)).rejects.toThrow('Compare error');
    });
  });

  describe('refreshTokens', () => {
    const refreshToken = 'mock-refresh-token-uuid';

    it('should refresh tokens successfully', async () => {
      refreshTokenModel.findOne.mockResolvedValue(mockRefreshToken);
      userModel.findById.mockImplementation((id) => {
        if (id.toString() === mockUserId.toString()) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      const result = await service.refreshTokens(refreshToken);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data?.accessToken).toBe('mock-access-token');
      expect(result.data?.refreshToken).toBe(refreshToken);
      expect(result.data?.userId).toBe(mockUserId.toString());
      expect(result.message).toBe('Token refreshed successfully');
      expect(refreshTokenModel.findOne).toHaveBeenCalledWith({
        token: refreshToken,
        expiryDate: { $gte: expect.any(Date) },
      });
      expect(userModel.findById).toHaveBeenCalledWith(expect.anything());
      expect(jwtService.sign).toHaveBeenCalledWith(
        { userId: mockUserId },
        { expiresIn: '15m' },
      );
    });

    it('should throw UnauthorizedException if refresh token not found', async () => {
      refreshTokenModel.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Refresh Token is invalid or expired'),
      );
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      // Service checks expiry in the query, so expired token means findOne returns null
      refreshTokenModel.findOne.mockResolvedValue(null);
      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Refresh Token is invalid or expired'),
      );
    });

    it('should throw UnauthorizedException if user no longer exists', async () => {
      refreshTokenModel.findOne.mockResolvedValue(mockRefreshToken);
      userModel.findById.mockResolvedValue(null);
      refreshTokenModel.deleteMany.mockResolvedValue({ deletedCount: 1 });

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        new UnauthorizedException('User no longer exists'),
      );

      expect(refreshTokenModel.deleteMany).toHaveBeenCalledWith({ userId: mockUserId.toString() });
    });

    it('should throw error if refreshTokenModel.findOne fails', async () => {
      refreshTokenModel.findOne.mockRejectedValue(new Error('Database error'));

      return await expect(service.refreshTokens(refreshToken)).rejects.toThrow('Database error');
    });

    it('should throw error if userModel.findById fails', async () => {
      refreshTokenModel.findOne.mockResolvedValue(mockRefreshToken);
      userModel.findById.mockRejectedValue(new Error('Database error'));

      return await expect(service.refreshTokens(refreshToken)).rejects.toThrow('Database error');
    });
  });

  describe('generateUserToken', () => {
    it('should generate access and refresh tokens successfully', async () => {
      refreshTokenModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.generateUserToken(mockUserId.toString());

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token-uuid');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { userId: mockUserId.toString() },
        { expiresIn: '15m' },
      );
      expect(refreshTokenModel.updateOne).toHaveBeenCalledWith(
        { userId: mockUserId.toString() },
        { $set: { expiryDate: expect.any(Date), token: 'mock-refresh-token-uuid' } },
        { upsert: true },
      );
    });

    it('should throw error if jwtService.sign fails', async () => {
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT error');
      });

      return await expect(service.generateUserToken(mockUserId.toString())).rejects.toThrow('JWT error');
    });

    it('should throw error if refreshTokenModel.updateOne fails', async () => {
      refreshTokenModel.updateOne.mockRejectedValue(new Error('Database error'));

      return await expect(service.generateUserToken(mockUserId.toString())).rejects.toThrow('Database error');
    });
  });

  describe('storeRefreshToken', () => {
    it('should store refresh token successfully', async () => {
      refreshTokenModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.storeRefreshToken('test-token', mockUserId.toString());

      expect(refreshTokenModel.updateOne).toHaveBeenCalledWith(
        { userId: mockUserId.toString() },
        { $set: { expiryDate: expect.any(Date), token: 'test-token' } },
        { upsert: true },
      );
    });

    it('should throw error if refreshTokenModel.updateOne fails', async () => {
      refreshTokenModel.updateOne.mockRejectedValue(new Error('Database error'));

      return await expect(service.storeRefreshToken('test-token', mockUserId.toString())).rejects.toThrow('Database error');
    });
  });
});

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  const signupData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
  };

  const loginData = {
    usernameOrEmail: 'test@example.com',
    password: 'password123',
  };

  const refreshTokenData = {
    refreshToken: 'mock-refresh-token-uuid',
  };

  const mockSignupResponse = {
    success: true,
    status: 201,
    data: { userId: mockUserId.toString() },
    message: 'User registered successfully',
  };

  const mockLoginResponse = {
    success: true,
    status: 200,
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token-uuid',
      userId: mockUserId.toString(),
    },
    message: 'Login successful',
  };

  const mockRefreshResponse = {
    success: true,
    status: 200,
    data: {
      accessToken: 'new-access-token',
      refreshToken: 'mock-refresh-token-uuid',
      userId: mockUserId.toString(),
    },
    message: 'Token refreshed successfully',
  };

  describe('signUp', () => {
    it('should return signup response on success', async () => {
      mockAuthService.signup.mockResolvedValue(mockSignupResponse);

      const result = await controller.signUp(signupData);

      expect(result).toEqual(mockSignupResponse);
      expect(mockAuthService.signup).toHaveBeenCalledWith(signupData);
    });

    it('should throw error from service', async () => {
      mockAuthService.signup.mockRejectedValue(new Error('Unexpected'));

      await expect(controller.signUp(signupData)).rejects.toThrow('Unexpected');
    });
  });

  describe('login', () => {
    it('should return login response on success', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginData);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    });

    it('should throw error from service', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Unexpected'));

      await expect(controller.login(loginData)).rejects.toThrow('Unexpected');
    });
  });

  describe('refreshTokens', () => {
    it('should return refresh response on success', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(mockRefreshResponse);

      const result = await controller.refreshTokens(refreshTokenData);

      expect(result).toEqual(mockRefreshResponse);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(refreshTokenData.refreshToken);
    });

    it('should throw error from service', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(new Error('Unexpected'));

      await expect(controller.refreshTokens(refreshTokenData)).rejects.toThrow('Unexpected');
    });
  });
});
