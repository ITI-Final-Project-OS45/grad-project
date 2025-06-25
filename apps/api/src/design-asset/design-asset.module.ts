import { Module } from '@nestjs/common';
import { DesignAssetService } from './design-asset.service';
import { DesignAssetController } from './design-asset.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DesignAsset, DesignAssetSchema } from 'src/schemas/design-asset.schema';
import { Workspace, WorkspaceSchema } from 'src/schemas/workspace.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { CloudinaryModule } from 'nestjs-cloudinary';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: DesignAsset.name,
        schema: DesignAssetSchema,
      },
      {
        name: Workspace.name,
        schema: WorkspaceSchema
      },
      {
        name: User.name,
        schema: UserSchema
      }
    ]),

    CloudinaryModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				isGlobal: true,
				cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
				api_key: configService.get('CLOUDINARY_API_KEY'),
				api_secret: configService.get('CLOUDINARY_API_SECRET'),
			}),
			inject: [ConfigService],
		}),
  ],
  // exports:[MongooseModule], // this is if you want other modules imorting this to have access to mongoose 
  controllers: [DesignAssetController],
  providers: [DesignAssetService],
})
export class DesignAssetModule {}
