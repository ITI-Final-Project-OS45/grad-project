import { CreatePrdDto, UpdatePrdDto, ApiError, ApiResponse } from '@repo/types';
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
import { Prd } from '../schemas/prd.schema';

@Controller('prd')
@UseGuards(AuthGuard)
export class PrdController {
  constructor(private readonly prdService: PrdService) {}

  @Post('workspace/:workspaceId')
  @HttpCode(HttpStatus.CREATED)
  async createPrd(
    @Param('workspaceId') workspaceId: string,
    @Body() createPrdDto: CreatePrdDto,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<Prd, ApiError>> {
    return await this.prdService.create(
      { ...createPrdDto, workspaceId },
      req.userId,
    );
  }

  @Get('workspace/:workspaceId')
  @HttpCode(HttpStatus.OK)
  async getPrdsByWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<ApiResponse<Prd[], ApiError>> {
    return await this.prdService.findByWorkspace(workspaceId);
  }

  @Put(':prdId')
  @HttpCode(HttpStatus.OK)
  async updatePrd(
    @Param('prdId') prdId: string,
    @Body() updatePrdDto: UpdatePrdDto,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<Prd, ApiError>> {
    return await this.prdService.updateById(prdId, updatePrdDto, req.userId);
  }

  @Delete(':prdId')
  @HttpCode(HttpStatus.OK)
  async deletePrd(
    @Param('prdId') prdId: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<null, ApiError>> {
    return await this.prdService.deleteById(prdId, req.userId);
  }
}
