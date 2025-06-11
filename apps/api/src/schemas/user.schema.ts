import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import type { UserRole } from '.../auth/dto/signup.dto';
import type { UserRole } from '../auth/dto/signup.dto';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true })
  displayName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Workspace' }], default: [] })
  workspaces!: string[];

  @Prop({ type: String, default: 'NA' })
  role!: UserRole; // 'Manager' | 'member' | 'NA'

  @Prop({ type: String, required: true })
  password!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
