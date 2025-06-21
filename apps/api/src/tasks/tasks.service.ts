import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from 'src/schemas/task.schema';
import { Model } from 'mongoose';
import { CreateTaskDto } from '@/../../packages/types/src/dtos/tasks/index';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async findAllByWorkspace(workspaceId: string) {
    return this.taskModel.find({ workspaceId }).exec();
  }

  async create(createTaskDto: CreateTaskDto) {
    const created = new this.taskModel(createTaskDto);
    return created.save();
  }

  async updateTask(id: string, updateTaskDto: Partial<CreateTaskDto>) {
    return this.taskModel.findByIdAndUpdate(id, updateTaskDto, { new: true });
  }

  async delete(taskId: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: taskId }).exec();
    if (result.deletedCount === 0) {
      throw new Error('Task not found');
    }
  }
}
