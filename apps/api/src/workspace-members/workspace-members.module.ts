import { Module } from '@nestjs/common';
import { WorkspaceMemberController } from './workspace-member.controller';
import { WorkspaceMemberService } from './workspace-member.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from 'src/schemas/workspace-member.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Workspace, WorkspaceSchema } from 'src/schemas/workspace.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
  ],
  controllers: [WorkspaceMemberController],
  providers: [WorkspaceMemberService],
})
export class WorkspaceMembersModule {}
