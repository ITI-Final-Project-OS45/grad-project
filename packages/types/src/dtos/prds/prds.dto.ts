import { IsString, IsDateString, IsOptional, IsArray, IsEnum, IsNotEmpty, IsNumber, IsEmpty } from "class-validator";

export class CreatePrdDto {
  @IsString()
  @IsOptional()
  workspaceId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class UpdatePrdDto {
  @IsString()
  @IsOptional()
  workspaceId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}

export class VersionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
