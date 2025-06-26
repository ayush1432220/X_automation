// File: src/twitter/jobs/post-tweet.processor.ts

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PostTweetJob } from './post-tweet.job'; // Humara main job logic

// NOTE: 'tweets' naam aapke queue ke naam se match karna chahiye
@Processor('tweets')
export class PostTweetProcessor {
  constructor(private readonly postTweetJob: PostTweetJob) {}

  @Process('post-tweet') // Job ka naam 'post-tweet' hai
  async handlePostTweet(job: Job<{ tweetId: string }>) {
    console.log(`Processing job ${job.id} of type ${job.name} with data:`, job.data);
    
    // Sahi data ke saath execute method ko call karein
    await this.postTweetJob.execute(job.data);
  }
}