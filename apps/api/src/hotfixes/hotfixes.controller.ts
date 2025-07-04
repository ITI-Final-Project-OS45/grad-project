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
import { HotfixesService } from './hotfixes.service';
import {
  CreateHotfixDto,
  UpdateHotfixDto,
  ApiError,
  ApiResponse,
  WorkspacePermission,
} from '@repo/types';
import { AuthGuard } from '../guards/auth.guards';
import type { RequestWithUser } from '../interfaces/request-user.interface';
import { Hotfix } from '../schemas/hotfix.schema';
import { WorkspaceAuthorizationGuard } from 'src/guards/workspace-authorization.guard';

@UseGuards(AuthGuard)
@UseGuards(WorkspaceAuthorizationGuard)
@SetMetadata('workspacePermission', WorkspacePermission.MEMBER)
@Controller('hotfixes')
export class HotfixesController {
  constructor(private readonly hotfixesService: HotfixesService) {}

  @Post('release/:releaseId')
  @HttpCode(HttpStatus.CREATED)
  @SetMetadata('workspacePermission', WorkspacePermission.MANAGER)
  async create(
    @Param('releaseId') releaseId: string,
    @Body() createHotfixDto: CreateHotfixDto,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<Hotfix, ApiError>> {
    return await this.hotfixesService.create(
      createHotfixDto,
      req.userId,
      releaseId,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<Hotfix[], ApiError>> {
    return await this.hotfixesService.findAll();
  }

  @Get('release/:releaseId')
  @HttpCode(HttpStatus.OK)
  async findByRelease(
    @Param('releaseId') releaseId: string,
  ): Promise<ApiResponse<Hotfix[], ApiError>> {
    return await this.hotfixesService.findByRelease(releaseId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Hotfix, ApiError>> {
    return await this.hotfixesService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER) // Will be validated in service
  async update(
    @Param('id') id: string,
    @Body() updateHotfixDto: UpdateHotfixDto,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<Hotfix, ApiError>> {
    return await this.hotfixesService.update(id, updateHotfixDto, req.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER) // Will be validated in service
  async delete(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<null, ApiError>> {
    return await this.hotfixesService.delete(id, req.userId);
  }
}
