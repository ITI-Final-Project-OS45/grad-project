import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface HotfixDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}
@Schema({ timestamps: true })
export class Hotfix {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Bug', required: true })
  bugId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Release', required: true })
  releaseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fixedBy!: Types.ObjectId;

  @Prop()
  fixedDate?: Date;

  @Prop({ type: [String], default: [] })
  attachedCommits!: string[];
}

export const HotfixSchema = SchemaFactory.createForClass(Hotfix);
