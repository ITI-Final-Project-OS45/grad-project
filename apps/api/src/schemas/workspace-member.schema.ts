import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from '@repo/types';
import { Types } from 'mongoose';

export interface WorkspaceMemberDocument extends WorkspaceMember, Document {
  createdAt: Date;
  updatedAt: Date;
}

@Schema()
export class WorkspaceMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: string;

  @Prop({ required: true, type: String })
  role!: UserRole; // "manager" | "developer" | "designer" | "qa'

  @Prop({ default: Date.now })
  joinedAt!: Date;
}

export const WorkspaceMemberSchema =
  SchemaFactory.createForClass(WorkspaceMember);
