import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrdController } from './prd.controller';
import { PrdService } from './prd.service';
import { Prd, PrdSchema } from '../schemas/prd.schema';
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';
import { AiService } from 'src/design-asset/ai.service';
import { TasksService } from 'src/tasks/tasks.service';
import { Task, TaskSchema } from 'src/schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prd.name, schema: PrdSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      {name: Task.name, schema: TaskSchema}
    ]),
  ],
  controllers: [PrdController],
  providers: [PrdService, AiService, TasksService],
  exports: [PrdService],
})
export class PrdsModule {}
