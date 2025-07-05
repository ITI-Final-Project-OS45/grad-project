import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Release, ReleaseSchema } from '../schemas/release.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: User.name, schema: UserSchema },
      { name: Release.name, schema: ReleaseSchema },
    ]),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspacesModule {}
