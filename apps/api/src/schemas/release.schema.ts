import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QAStatus, ReleaseStatus } from '@repo/types';

export interface ReleaseDocument extends Release, Document {
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Release {
  @Prop({ required: true })
  versionTag!: string;

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  plannedDate!: Date;

  @Prop()
  deployedDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deployedBy?: Types.ObjectId;

  //  TODO: Uncomment when Task/Development schema is available
  // @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] })
  // associatedTasks!: Types.ObjectId[];

  @Prop({ type: String, enum: QAStatus, default: QAStatus.PENDING })
  qaStatus!: QAStatus;

  @Prop({ type: String, enum: ReleaseStatus, default: ReleaseStatus.PLANNED })
  status!: ReleaseStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Bug' }], default: [] })
  bugs!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Hotfix' }], default: [] })
  hotfixes!: Types.ObjectId[];
}

export const ReleaseSchema = SchemaFactory.createForClass(Release);
