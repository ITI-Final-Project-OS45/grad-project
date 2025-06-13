import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import type {
  SignupDto,
  LoginDto,
  ApiResponse,
  SignUpResponse,
  ApiError,
  LoginResponse,
} from '@repo/types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly RefreshTokenModel: Model<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(
    signupData: SignupDto,
  ): Promise<ApiResponse<SignUpResponse, ApiError>> {
    // check if the email or user name exists

    const { email, username, password, displayName } = signupData;

    const isEmailExist = await this.UserModel.findOne({
      email: email,
    }).exec();

    if (isEmailExist) {
      throw new BadRequestException('Email or Username already exists');
    }

    const isUsernameExist = await this.UserModel.findOne({
      username: username,
    }).exec();

    if (isUsernameExist) {
      throw new BadRequestException('Email or Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); //

    // create new user
    const newUser = await this.UserModel.create({
      username,
      email,
      password: hashedPassword,
      displayName,
    });
    return {
      success: true,
      status: HttpStatus.CREATED,
      data: { userId: String(newUser._id) },
      message: 'User registered successfully',
    };
  }

  async login(
    loginData: LoginDto,
  ): Promise<ApiResponse<LoginResponse, ApiError>> {
    const { usernameOrEmail, password } = loginData;

    // Find user by email or username
    const user = await this.UserModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    }).exec();

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    // generate JWT

    const tokens = await this.generateUserToken(String(user._id));
    return {
      success: true,
      status: HttpStatus.OK,
      data: { ...tokens, userId: String(user._id) },
      message: 'Login successful',
    };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<ApiResponse<LoginResponse, ApiError>> {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid or expired');
    }

    // Get user to include role in new access token
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      await this.RefreshTokenModel.deleteMany({ userId: token.userId });
      throw new UnauthorizedException('User no longer exists');
    }

    // Generate only a new access token, keep the same refresh token
    const accessToken = this.jwtService.sign(
      { userId: user._id },
      { expiresIn: '15m' },
    );

    return {
      success: true,
      status: HttpStatus.OK,
      data: {
        accessToken,
        refreshToken, // Return the same refresh token
        userId: String(user._id),
      },
      message: 'Token refreshed successfully',
    };
  }

  async generateUserToken(userId: string) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '15m' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(token: string, userId: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      { upsert: true },
    );
  }
}
