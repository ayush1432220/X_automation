// File: src/twitter/twitter.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tweet, TweetSchema } from './schemas/tweet.schema';
import { User, UserSchema } from '../Auth/schemas/user.schema'; // ✅ Import User model

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Tweet.name, schema: TweetSchema },
      { name: User.name, schema: UserSchema }, // ✅ Register User model here
    ]),
  ],
  controllers: [TwitterController],
  providers: [TwitterService],
  exports: [TwitterService, MongooseModule],
})
export class TwitterModule {}
