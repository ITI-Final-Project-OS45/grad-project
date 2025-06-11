import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema()
export class Workspace extends Document {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: string; // user.username

  @Prop({ default: Date.now })
  createdAt!: Date;
}
export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
