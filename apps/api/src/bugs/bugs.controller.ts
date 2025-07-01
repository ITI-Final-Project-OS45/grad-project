import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { BugsService } from './bugs.service';
import {
  CreateBugDto,
  UpdateBugDto,
  ApiError,
  ApiResponse,
  WorkspacePermission,
} from '@repo/types';
import { AuthGuard } from '../guards/auth.guards';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';
import type { RequestWithUser } from '../interfaces/request-user.interface';
import { Bug } from '../schemas/bug.schema';

@UseGuards(AuthGuard)
@UseGuards(WorkspaceAuthorizationGuard)
@SetMetadata('workspacePermission', WorkspacePermission.MEMBER)
@Controller('bugs')
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBugDto: CreateBugDto,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<Bug, ApiError>> {
    return await this.bugsService.create(createBugDto, req.userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<Bug[], ApiError>> {
    return await this.bugsService.findAll();
  }

  @Get('release/:releaseId')
  @HttpCode(HttpStatus.OK)
  async findByRelease(
    @Param('releaseId') releaseId: string,
  ): Promise<ApiResponse<Bug[], ApiError>> {
    return await this.bugsService.findByRelease(releaseId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<ApiResponse<Bug, ApiError>> {
    return await this.bugsService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER) // Will be validated in service
  async update(
    @Param('id') id: string,
    @Body() updateBugDto: UpdateBugDto,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<Bug, ApiError>> {
    return await this.bugsService.update(id, updateBugDto, req.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER) // Will be validated in service
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<null, ApiError>> {
    return await this.bugsService.delete(id, req.userId);
  }
}
