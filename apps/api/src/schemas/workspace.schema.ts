import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface WorkspaceDocument extends Workspace, Document {
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: string; // user.username

  @Prop({ type: Types.ObjectId, ref: 'Release', default: [] })
  releases?: Types.ObjectId[];
}
export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
