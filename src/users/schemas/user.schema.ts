// schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  avatar?: string; // base64-encoded avatar

  @Prop({ unique: true, index: true }) // Define userId as unique
  userId: string;
}
export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
