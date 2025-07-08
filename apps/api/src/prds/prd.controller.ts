import { CreatePrdDto, UpdatePrdDto } from '@repo/types';
// import { Delete } from '@nestjs/common';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Param,
  Get,
  Put,
  Req,
  Delete,
} from '@nestjs/common';
import { PrdService } from './prd.service';
import { AuthGuard } from 'src/guards/auth.guards';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';

@Controller('workspaces/:workspaceId/prd')
@UseGuards(AuthGuard)
export class PrdController {
  constructor(private readonly prdService: PrdService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPrd(
    @Param('workspaceId') workspaceId: string,
    @Body() createPrdDto: CreatePrdDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.prdService.create(
      { ...createPrdDto, workspaceId },
      req.userId,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPrdsByWorkspace(@Param('workspaceId') workspaceId: string) {
    return await this.prdService.findByWorkspace(workspaceId);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updatePrd(
    @Param('workspaceId') workspaceId: string,
    @Body() updatePrdDto: UpdatePrdDto,
    @Req() req: RequestWithUser,
  ) {
    // Update the latest PRD for the workspace
    return await this.prdService.updateByWorkspace(
      workspaceId,
      updatePrdDto,
      req.userId,
    );
  }
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deletePrd(
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return await this.prdService.deleteByWorkspace(workspaceId, req.userId);
  }
}
