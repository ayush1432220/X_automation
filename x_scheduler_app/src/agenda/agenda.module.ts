// agenda.module.ts
import { Module, Global, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Agenda } from '@hokify/agenda';
import { HttpModule } from '@nestjs/axios';
import { Tweet, TweetSchema } from '../twitter/schemas/tweet.schema';
import { User, UserSchema } from '../Auth/schemas/user.schema';
import { TwitterModule } from '../twitter/twitter.module';
import { AuthModule } from '../Auth/auth.module';
import { PostTweetJob } from '../twitter/jobs/post-tweet.job';

export const AGENDA_TOKEN = 'AGENDA';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tweet.name, schema: TweetSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
     HttpModule,
    forwardRef(() => TwitterModule),
    forwardRef(() => AuthModule), // In case of circular dependency
  ],
  providers: [
    {
      provide: AGENDA_TOKEN,
      useFactory: async (configService: ConfigService, postTweetJob: PostTweetJob) => {
        const agenda = new Agenda({
          db: {
            address: configService.get<string>('MONGODB_URI'),
            collection: 'agendaJobs',
          },
          processEvery: '1 minute',
        });

        agenda.define('post-tweet', async (job) => {
          const jobData = job.attrs.data as { tweetId: string };
          await postTweetJob.execute(jobData);
        });

        await agenda.start();
        console.log('🚀 Agenda.js scheduler started successfully.');

        return agenda;
      },
      inject: [ConfigService, PostTweetJob],
    },
    PostTweetJob,
  ],
  exports: [AGENDA_TOKEN],
})
export class AgendaModule {}
