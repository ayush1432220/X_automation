import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Tweet } from '../schemas/tweet.schema';
import { User, UserDocument } from '../../Auth/schemas/user.schema';
import { AuthService } from '../../Auth/auth.service';

@Injectable()
export class PostTweetJob {
  private readonly logger = new Logger(PostTweetJob.name);
  private readonly twitterApiUrl = 'https://api.twitter.com/2';

  constructor(
    @InjectModel(Tweet.name) private readonly tweetModel: Model<Tweet>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
  ) {}

  

  async execute(job: { tweetId: string }): Promise<void> {
    const { tweetId } = job;
    this.logger.log(`Executing job for tweetId: ${tweetId}`);

    const tweet = await this.tweetModel.findById(tweetId);
    if (!tweet) {
      throw new Error(`Tweet with ID ${tweetId} not found.`);
    }

    if (tweet.status !== 'scheduled') {
      this.logger.warn(`Tweet ${tweetId} is not in a 'scheduled' state. Current status: ${tweet.status}. Skipping.`);
      return;
    }

    const user = await this.userModel.findById(tweet.userId);
    if (!user) {
      tweet.status = 'failed';
      tweet.error = `User with ID ${tweet.userId} not found.`;
      await tweet.save();
      throw new Error(`User not found for tweet ${tweetId}.`);
    }

    try {
      if (user.tokenExpiresAt && user.tokenExpiresAt <= new Date()) {
        this.logger.warn(`Token for user ${user._id} has expired. Attempting to refresh.`);

      
        if (!user.refreshToken) {
          throw new Error(`Cannot refresh token for user ${user._id}. No refresh token available. User must re-authenticate.`);
        }

        const newTokens = await this.authService.refreshAccessToken(user.refreshToken);

        user.accessToken = newTokens.accessToken;
        user.refreshToken = newTokens.refreshToken || user.refreshToken;
        user.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
        
        await user.save();
        this.logger.log(`Token for user ${user._id} refreshed successfully.`);
      }

      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.twitterApiUrl}/tweets`,
          { text: tweet.text },
          { headers: { 'Authorization': `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' } },
        ),
      );

      tweet.twitterId = data.data.id;
      tweet.status = 'posted';
      tweet.postedAt = new Date();
      tweet.error = undefined;
      await tweet.save();

      this.logger.log(`Tweet ${tweetId} posted successfully to Twitter with ID: ${tweet.twitterId}`);

    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      this.logger.error(`Failed to process job for tweet ${tweetId}: ${errorMessage}`, error.stack);

      tweet.status = 'failed';
      tweet.error = errorMessage;
      await tweet.save();
      
      throw error;
    }
  }
}