import { IsString, IsEmail, IsDate, IsArray, IsMongoId } from "class-validator";

export class UserDto {
  @IsString()
  username!: string;

  @IsString()
  displayName!: string;

  @IsEmail()
  email!: string;

  @IsArray()
  @IsString({ each: true })
  workspaces!: string[];

  @IsString()
  password!: string;

  @IsDate()
  createdAt!: Date;
}
