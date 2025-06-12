import { IsString, IsEmail, MinLength } from 'class-validator';

export type UserRole = 'Manager' | 'member' | 'NA';

export class SignupDto {
  @IsString()
  username!: string;

  @IsString()
  displayName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
