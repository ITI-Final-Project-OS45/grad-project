import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
} from "class-validator";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  status!: "todo" | "in-progress" | "done";

  @IsString({ each: true })
  @IsNotEmpty()
  assignedTo!: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsIn(["low", "medium", "high"])
  @IsOptional()
  priority?: "low" | "medium" | "high"; // Add priority property

  @IsNotEmpty()
  position!: number;
}
