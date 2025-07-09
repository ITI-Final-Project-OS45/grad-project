import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrdController } from './prd.controller';
import { PrdService } from './prd.service';
import { Prd, PrdSchema } from '../schemas/prd.schema';
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prd.name, schema: PrdSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
  ],
  controllers: [PrdController],
  providers: [PrdService],
  exports: [PrdService],
})
export class PrdsModule {}
