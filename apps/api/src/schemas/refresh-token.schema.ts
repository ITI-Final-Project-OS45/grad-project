import { Document } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
@Schema({ versionKey: false, timestamps: true })
export class RefreshToken extends Document {
  @Prop({ required: true })
  token!: string;

  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ required: true })
  expiryDate!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
