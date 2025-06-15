import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class WorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;
}
