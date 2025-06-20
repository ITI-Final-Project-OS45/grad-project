import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, enum: ['todo', 'in-progress', 'done'] })
  status!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  assignedTo!: Types.ObjectId[];

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId!: Types.ObjectId;

  @Prop()
  dueDate?: Date;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
