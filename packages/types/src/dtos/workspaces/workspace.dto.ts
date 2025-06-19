import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";
import { UserRole } from "../../enums";

export class WorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateIf((object, value) => value !== undefined && value !== null)
  members?: UserRole[];

  @IsString()
  @IsOptional()
  createdBy?: string;
}
