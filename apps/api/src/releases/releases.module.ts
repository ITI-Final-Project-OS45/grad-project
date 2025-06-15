import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReleaseController } from './release.controller';
import { ReleaseService } from './release.service';
import { Release, ReleaseSchema } from '../schemas/release.schema';
import { Bug, BugSchema } from '../schemas/bug.schema';
import { Hotfix, HotfixSchema } from '../schemas/hotfix.schema';

import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Release.name, schema: ReleaseSchema },
      { name: Bug.name, schema: BugSchema },
      { name: Hotfix.name, schema: HotfixSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
  ],
  controllers: [ReleaseController],
  providers: [ReleaseService],
  exports: [ReleaseService],
})
export class ReleasesModule {}
