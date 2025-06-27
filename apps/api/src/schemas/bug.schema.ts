import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BugSeverity, BugStatus } from '@repo/types';

export interface BugDocument extends Bug, Document {
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Bug {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({
    type: String,
    enum: BugSeverity,
    required: true,
  })
  severity!: BugSeverity;

  @Prop({ type: String, enum: BugStatus, default: BugStatus.OPEN })
  status!: BugStatus;

  @Prop({ type: Types.ObjectId, ref: 'Release', required: true })
  releaseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop()
  stepsToReproduce?: string;

  @Prop()
  expectedBehavior?: string;

  @Prop()
  actualBehavior?: string;
}

export const BugSchema = SchemaFactory.createForClass(Bug);
