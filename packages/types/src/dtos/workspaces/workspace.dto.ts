import { IsString, IsDate, IsMongoId } from "class-validator";

export class WorkspaceDto {
  @IsMongoId()
  _id!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  createdBy!: string;

  @IsDate()
  createdAt!: Date;

  @IsDate()
  updatedAt!: Date;
}
