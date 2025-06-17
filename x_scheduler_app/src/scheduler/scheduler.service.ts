import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Tweet } from '../twitter/schemas/tweet.schema';
import { User, UserDocument } from '../Auth/schemas/user.schema';
import { AuthService } from '../Auth/auth.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly twitterApiUrl = 'https://api.twitter.com/2';

  constructor(
    @InjectModel(Tweet.name) private tweetModel: Model<Tweet>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledTweets() {
    this.logger.log('Checking for scheduled tweets...');

    try {
      const now = new Date();
      const scheduledTweets = await this.tweetModel
        .find({
          status: 'scheduled',
          scheduledAt: { $lte: now },
        })
        .populate('userId');

      if (scheduledTweets.length > 0) {
        this.logger.log(`Found ${scheduledTweets.length} tweets to process`);
        for (const tweet of scheduledTweets) {
          await this.executeTweet(tweet);
        }
      }
    } catch (error) {
      this.logger.error('Error processing scheduled tweets:', error);
    }
  }

  async executeTweet(tweet: any) {
    if (!tweet.userId) {
      this.logger.error(`Tweet ${tweet._id} has no populated user. Marking as failed.`);
      tweet.status = 'failed';
      tweet.error = 'User ID was not populated correctly or user does not exist.';
      await tweet.save();
      return;
    }

    const user = tweet.userId as UserDocument;

    try {
      this.logger.log(`Executing tweet: ${tweet._id} for user: ${user.username}`);
      
      if (!user.accessToken) {
        throw new Error(`Access Token not found for user: ${user.username}`);
      }

      if (user.tokenExpiresAt && new Date() >= user.tokenExpiresAt) {
        this.logger.warn(`Token expired for user ${user._id}. Refreshing...`);
        const refreshedUser = await this.refreshUserToken(user);
        user.accessToken = refreshedUser.accessToken;
      }

      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.twitterApiUrl}/tweets`,
          { text: tweet.text },
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      tweet.twitterId = data.data.id;
      tweet.status = 'posted';
      tweet.postedAt = new Date();
      await tweet.save();

      this.logger.log(`Tweet posted successfully: ${tweet.twitterId}`);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      this.logger.error(`Failed to post tweet ${tweet._id}: ${errorMessage}`, error.stack);
      
      tweet.status = 'failed';
      tweet.error = errorMessage;
      await tweet.save();
    }
  }

  async refreshUserToken(user: UserDocument): Promise<UserDocument> {
    if (!user.refreshToken) {
      this.logger.error(`Cannot refresh token for user ${user._id}. No refresh token available.`);
      throw new Error('Token refresh failed: No refresh token available.');
    }

    try {
      this.logger.log(`Attempting to refresh token for user ${user._id}`);
      const newTokens = await this.authService.refreshAccessToken(user.refreshToken);

      user.accessToken = newTokens.accessToken;
      user.refreshToken = newTokens.refreshToken || user.refreshToken;
      user.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
      
      await user.save();
      this.logger.log(`Token refreshed and saved for user ${user._id}`);
      return user;
    } catch (error) {
      this.logger.error(`Could not refresh token for user ${user._id}.`, error);
      throw new Error('Token refresh failed during API call.');
    }
  }
}