// src/scheduler/scheduler.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { SchedulerService } from './scheduler.service';
import { Tweet, TweetSchema } from '../twitter/schemas/tweet.schema';
import { User, UserSchema } from '../Auth/schemas/user.schema';
import { AuthModule } from '../Auth/auth.module'; // <-- ADDED
import { TwitterModule } from '../twitter/twitter.module'; // <-- IMPORT THIS


@Module({
  imports: [
    HttpModule,
    AuthModule,
    TwitterModule, // <-- ADDED
    MongooseModule.forFeature([
      { name: Tweet.name, schema: TweetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}