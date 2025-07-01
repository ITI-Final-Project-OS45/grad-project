import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HotfixStatus } from '@repo/types';
import { Document, Types } from 'mongoose';

export interface HotfixDocument extends Hotfix, Document {
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Hotfix {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Release', required: true })
  releaseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fixedBy!: Types.ObjectId;

  @Prop()
  fixedDate?: Date;

  @Prop({ type: String, enum: HotfixStatus, default: HotfixStatus.PENDING })
  status!: HotfixStatus;

  @Prop({ type: [String], default: [] })
  attachedCommits!: string[];
}

export const HotfixSchema = SchemaFactory.createForClass(Hotfix);
