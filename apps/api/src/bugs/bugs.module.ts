import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bug, BugSchema } from '../schemas/bug.schema';
import { Release, ReleaseSchema } from '../schemas/release.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';
import { BugsController } from './bugs.controller';
import { BugsService } from './bugs.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bug.name, schema: BugSchema },
      { name: Release.name, schema: ReleaseSchema },
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
  ],
  controllers: [BugsController],
  providers: [BugsService],
  exports: [BugsService],
})
export class BugsModule {}
