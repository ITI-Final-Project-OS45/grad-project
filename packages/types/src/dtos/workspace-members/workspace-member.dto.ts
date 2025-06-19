import { IsDate, IsEnum, IsMongoId, IsString } from "class-validator";
import { UserRole } from "../../enums";

export class WorkspaceMemberDto {
  @IsMongoId()
  userId!: string;

  @IsString()
  @IsEnum(UserRole, { message: "Role must be a valid UserRole" })
  role!: UserRole; // "manager" | "developer" | "designer" | "qa"

  @IsDate()
  joinedAt!: Date;
}
