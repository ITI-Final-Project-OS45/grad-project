import { Module } from '@nestjs/common';
import { DesignAssetService } from './design-asset.service';
import { DesignAssetController } from './design-asset.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignAsset, DesignAssetSchema } from 'src/schemas/design-asset.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DesignAsset.name,
        schema: DesignAssetSchema,
      },
    ])
  ],
  // exports:[MongooseModule], // this is if you want other modules imorting this to have access to mongoose 
  controllers: [DesignAssetController],
  providers: [DesignAssetService],
})
export class DesignAssetModule {}
