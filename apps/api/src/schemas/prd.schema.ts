import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { QAStatus, ReleaseStatus } from '@repo/types';

export interface PrdDocument extends Prd, Document {
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Prd {
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({
    type: [
      {
        versionNo: { type: Number, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdBy: { type: Types.ObjectId, ref: 'User', required: true },
      },
    ],
    default: [],
  })
  versions!: {
    versionNo: number;
    title: string;
    content: string;
    createdBy: Types.ObjectId;
  }[];
}

export const PrdSchema = SchemaFactory.createForClass(Prd);
