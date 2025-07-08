import { ApiError, ApiResponse, CreatePrdDto, UpdatePrdDto } from '@repo/types';
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
  Delete,
  Req,
} from '@nestjs/common';
import { PrdService } from './prd.service';
import { AuthGuard } from 'src/guards/auth.guards';
// import { Prd } from 'src/schemas/prd.schema';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';
import { Prd } from 'src/schemas/prd.schema';

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
    // Ensure workspaceId is set in DTO
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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPrdById(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ) {
    // Optionally, you can check if the PRD belongs to the workspace
    return await this.prdService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updatePrd(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body() updatePrdDto: UpdatePrdDto,
    @Req() req: RequestWithUser,
  ) {
    // Optionally, you can check if the PRD belongs to the workspace
    return await this.prdService.update(id, updatePrdDto, req.userId);
  }

  //   @Post(':id/version')
  //   @HttpCode(HttpStatus.OK)
  //   async addVersion(
  //     @Param('id') id: string,
  //     @Body() versionDto: any, // { title, content }
  //     @Req() req: RequestWithUser,
  //   ) {
  //     return await this.prdService.addVersion(id, versionDto, req.userId);
  //   }
}
