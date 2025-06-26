import { IsDate, IsEnum, IsMongoId, IsString } from "class-validator";
import { InviteStatus, UserRole } from "../../enums";

export class InviteDto {
  @IsMongoId()
  userId!: string;

  @IsEnum(InviteStatus)
  status!: InviteStatus;

  @IsMongoId()
  workspaceId!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsMongoId()
  invitedBy!: string;

  @IsDate()
  sentAt!: Date;

  @IsDate()
  acceptedAt!: Date;
}
