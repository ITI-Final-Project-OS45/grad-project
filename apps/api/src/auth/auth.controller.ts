import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  SignupDto,
  LoginDto,
  RefreshTokenDto,
  SignUpResponse,
  ApiError,
  ApiResponse,
  LoginResponse,
} from '@repo/types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup') // ==> /auth/signup
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signupData: SignupDto,
  ): Promise<ApiResponse<SignUpResponse, ApiError>> {
    return this.authService.signup(signupData);
  }

  @Post('login') // ==> /auth/login
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginData: LoginDto,
  ): Promise<ApiResponse<LoginResponse, ApiError>> {
    return this.authService.login(loginData);
  }

  @Post('refresh') // ==> /auth/refresh
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}
