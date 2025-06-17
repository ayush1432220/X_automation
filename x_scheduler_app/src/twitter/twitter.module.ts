import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tweet, TweetSchema } from './schemas/tweet.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Tweet.name, schema: TweetSchema }]),
  ],
  controllers: [TwitterController],
  providers: [TwitterService],
  exports: [TwitterService, MongooseModule],
})
export class TwitterModule {}