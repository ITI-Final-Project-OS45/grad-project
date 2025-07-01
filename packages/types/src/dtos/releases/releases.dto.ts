import { IsString, IsDateString, IsOptional, IsArray, IsEnum, IsNotEmpty } from "class-validator";
import { QAStatus, HotfixStatus } from "../../enums/index";
import { BugSeverity, BugStatus } from "../../enums/bug.enum";

export class CreateReleaseDto {
  @IsString()
  @IsNotEmpty()
  versionTag!: string;

  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  plannedDate!: string;
}

export class UpdateReleaseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  versionTag?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsDateString()
  plannedDate?: string;
}

export class DeployReleaseDto {
  @IsOptional()
  @IsString()
  deploymentNotes?: string;
}

export class UpdateQAStatusDto {
  @IsEnum(QAStatus)
  qaStatus: QAStatus = QAStatus.PENDING;
}

export class CreateBugDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(BugSeverity)
  severity!: BugSeverity;

  @IsString()
  @IsNotEmpty()
  releaseId!: string;

  @IsOptional()
  @IsString()
  stepsToReproduce?: string;

  @IsOptional()
  @IsString()
  expectedBehavior?: string;

  @IsOptional()
  @IsString()
  actualBehavior?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class UpdateBugDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(BugSeverity)
  severity?: BugSeverity;

  @IsOptional()
  @IsEnum(BugStatus)
  status?: BugStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  stepsToReproduce?: string;

  @IsOptional()
  @IsString()
  expectedBehavior?: string;

  @IsOptional()
  @IsString()
  actualBehavior?: string;
}

export class CreateHotfixDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachedCommits?: string[];

  @IsOptional()
  @IsString()
  deploymentNotes?: string;
}

export class UpdateHotfixDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsEnum(HotfixStatus)
  status?: HotfixStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachedCommits?: string[];

  @IsOptional()
  @IsString()
  deploymentNotes?: string;

  @IsOptional()
  @IsDateString()
  fixedDate?: string;
}
