import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { WorkspaceMemberDto } from '@repo/types';
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

  @Prop({
    type: [
      {
        userId: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  members!: WorkspaceMemberDto[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: string; // user.id

  @Prop({ type: Types.ObjectId, ref: 'Release', default: [] })
  releases?: Types.ObjectId[];
}
export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
