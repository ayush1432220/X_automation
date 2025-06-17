import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Tweet } from './schemas/tweet.schema';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { ScheduleTweetDto } from './dto/schedule-tweet.dto';

@Injectable()
export class TwitterService {
  private readonly twitterApiUrl = 'https://api.twitter.com/2';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Tweet.name) private tweetModel: Model<Tweet>,
  ) {}

  // Post tweet immediately
  async postTweet(createTweetDto: CreateTweetDto, accessToken: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.twitterApiUrl}/tweets`,
          { text: createTweetDto.text },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // Save to database
      const tweet = new this.tweetModel({
        text: createTweetDto.text,
        twitterId: data.data.id,
        status: 'posted',
        postedAt: new Date(),
      });
      await tweet.save();

      return {
        success: true,
        data: data.data,
        message: 'Tweet posted successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to post tweet: ${error.response?.data?.detail || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Schedule tweet for later
  async scheduleTweet(scheduleTweetDto: ScheduleTweetDto, userId: string) {
    try {
      const scheduledTweet = new this.tweetModel({
        text: scheduleTweetDto.text,
        userId: userId,
        scheduledAt: new Date(scheduleTweetDto.scheduledAt),
        status: 'scheduled',
        createdAt: new Date(),
      });

      await scheduledTweet.save();

      return {
        success: true,
        data: scheduledTweet,
        message: 'Tweet scheduled successfully',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to schedule tweet: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get scheduled tweets
  async getScheduledTweets(userId: string) {
    return this.tweetModel.find({
      userId,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() },
    }).sort({ scheduledAt: 1 });
  }

  // Get posted tweets
  async getPostedTweets(userId: string) {
    return this.tweetModel.find({
      userId,
      status: 'posted',
    }).sort({ postedAt: -1 });
  }

  // Execute scheduled tweet
  async executeScheduledTweet(tweetId: string, accessToken: string) {
    const tweet = await this.tweetModel.findById(tweetId);
    if (!tweet || tweet.status !== 'scheduled') {
      throw new HttpException('Tweet not found or not scheduled', HttpStatus.NOT_FOUND);
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.twitterApiUrl}/tweets`,
          { text: tweet.text },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // Update tweet status
      tweet.twitterId = data.data.id;
      tweet.status = 'posted';
      tweet.postedAt = new Date();
      await tweet.save();

      return {
        success: true,
        data: data.data,
        message: 'Scheduled tweet posted successfully',
      };
    } catch (error) {
      // Mark as failed
      tweet.status = 'failed';
      tweet.error = error.response?.data?.detail || error.message;
      await tweet.save();
      
      throw new HttpException(
        `Failed to post scheduled tweet: ${error.response?.data?.detail || error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}