import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  twitterId: string;

  @Prop()
  username: string;

  @Prop()
  displayName: string;

  @Prop()
  profileImageUrl: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  tokenExpiresAt?: Date;

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
