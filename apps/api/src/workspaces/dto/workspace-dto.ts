import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  createdBy!: string;

  @IsOptional()
  createdAt!: Date;
}
