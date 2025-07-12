import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, SetMetadata } from '@nestjs/common';
import { DesignAssetService } from './design-asset.service';
import {
  DesignAssetDto,
  UpdateDesignAssetDto,
  WorkspacePermission
} from '@repo/types'
import { AuthGuard } from 'src/guards/auth.guards';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkspaceAuthorizationGuard } from 'src/guards/workspace-authorization.guard';

@UseGuards(AuthGuard)
@Controller('design-assets')
export class DesignAssetController {
  constructor(private readonly designAssetService: DesignAssetService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() designAsset: DesignAssetDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File
 ) {
    return this.designAssetService.create(designAsset, req.userId, file);
  }

  @Get('workspaces/:id')
  findAll(
    @Param('id') id: string
) {
    return this.designAssetService.findAll(id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.designAssetService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() designAsset: UpdateDesignAssetDto,
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File
  ) {
    
    return this.designAssetService.update(id, designAsset, file, req.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser
  ) {
    return this.designAssetService.remove(id, req.userId);
  }
}
