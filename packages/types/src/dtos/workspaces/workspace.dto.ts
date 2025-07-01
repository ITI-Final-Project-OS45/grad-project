import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";
import { UserRole } from "../../enums";
import { WorkspaceMemberDto } from "../workspace-members";

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
  members?: WorkspaceMemberDto[];

  @IsString()
  @IsOptional()
  createdBy?: string;
}
