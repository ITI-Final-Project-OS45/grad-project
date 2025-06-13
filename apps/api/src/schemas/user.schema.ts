import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface UserDocument extends User, Document {
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true })
  displayName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Workspace' }], default: [] })
  workspaces!: Types.ObjectId[];

  @Prop({ type: String, required: true })
  password!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
