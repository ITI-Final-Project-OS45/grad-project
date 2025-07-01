import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InviteStatus, UserRole } from '@repo/types';

export interface InviteDocument extends Invite, Document {
  createdAt: Date;
  updatedAt: Date;
}

@Schema()
export class Invite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: string;

  @Prop({ type: String, default: 'pending' })
  status!: InviteStatus; // 'pending' | 'accepted' | 'declined'

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId!: string;

  @Prop({ type: String, required: true })
  role!: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitedBy!: string; // user._id

  @Prop({ type: Date, default: Date.now })
  sentAt!: Date;

  @Prop({ type: Date })
  acceptedAt!: Date;

  // add the role
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
