import { IsString, IsEmail, MinLength } from "class-validator";

export class SignupDto {
  @IsString()
  username!: string;

  @IsString()
  displayName!: string;

  @IsString()
  @IsEmail({}, { message: "Please enter a valid email address" })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
