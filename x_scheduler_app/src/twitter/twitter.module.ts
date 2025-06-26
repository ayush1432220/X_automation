// File: src/twitter/twitter.module.ts

import { Module , forwardRef} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tweet, TweetSchema } from './schemas/tweet.schema';
import { User, UserSchema } from '../Auth/schemas/user.schema'; 
import { PostTweetJob } from './jobs/post-tweet.job'; 
import { AuthModule } from '../Auth/auth.module';
import { PostTweetProcessor } from './jobs/post-tweet.processor';
import { AgendaModule } from '../agenda/agenda.module'; // <-- AgendaModule import karein


@Module({
  imports: [
    HttpModule,
     AuthModule, 
     forwardRef(() => AgendaModule),
    MongooseModule.forFeature([
      { name: Tweet.name, schema: TweetSchema },
      { name: User.name, schema: UserSchema }, 
    ]),
  ],
  controllers: [TwitterController],
  providers: [TwitterService, PostTweetJob, PostTweetProcessor,],
  exports: [TwitterService, PostTweetJob],
})
export class TwitterModule {}
