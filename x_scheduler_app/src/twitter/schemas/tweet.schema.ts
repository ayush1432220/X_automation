import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Tweet extends Document {
  @Prop({ required: true })
  text: string;

  @Prop()
  twitterId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId?: string;

  @Prop({ enum: ['scheduled', 'posted', 'failed'], default: 'scheduled' })
  status: string;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  postedAt?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  error?: string;
}

export const TweetSchema = SchemaFactory.createForClass(Tweet);