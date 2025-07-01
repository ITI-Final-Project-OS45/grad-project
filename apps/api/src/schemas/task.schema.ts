import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, enum: ['todo', 'in-progress', 'done'] })
  status!: 'todo' | 'in-progress' | 'done';

  @Prop({ type: [String], required: true })
  assignedTo!: string[];

  @Prop()
  description?: string;

  @Prop({ required: true })
  workspaceId!: string;

  @Prop()
  dueDate?: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority?: 'low' | 'medium' | 'high';
}

export const TaskSchema = SchemaFactory.createForClass(Task);
export type TaskDocument = Task & Document;
