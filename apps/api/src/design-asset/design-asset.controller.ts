import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DesignAssetService } from './design-asset.service';
import type {
  DessignAssetDto
} from '@repo/types'

@Controller('design-assets')
export class DesignAssetController {
  constructor(private readonly designAssetService: DesignAssetService) {}

  @Post()
  create(@Body() designAsset: DessignAssetDto ) {
    console.log(`🟢 create@DesignAssetController: <- `, designAsset);
    
    return this.designAssetService.create(designAsset);
  }

  @Get()
  findAll() {
    return this.designAssetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designAssetService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() DesignAssetDto) {
    return this.designAssetService.update(+id, DesignAssetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.designAssetService.remove(+id);
  }
}
