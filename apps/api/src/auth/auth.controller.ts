import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SignupDto,
  LoginDto,
  RefreshTokenDto,
  SignUpResponse,
  ApiError,
  ApiResponse,
  LoginResponse,
} from '@repo/types';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup') // ==> /api/v1/auth/signup
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signupData: SignupDto,
  ): Promise<ApiResponse<SignUpResponse, ApiError>> {
    return this.authService.signup(signupData);
  }

  @Post('login') // ==> /api/v1/auth/login
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginData: LoginDto,
  ): Promise<ApiResponse<LoginResponse, ApiError>> {
    return this.authService.login(loginData);
  }

  @Post('refresh') // ==> /api/v1/auth/refresh
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
}
