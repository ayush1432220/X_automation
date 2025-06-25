// File: src/twitter/twitter.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Tweet,TweetSchema } from './schemas/tweet.schema';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { ScheduleTweetDto } from './dto/schedule-tweet.dto';
import { User, UserDocument ,UserSchema} from '../Auth/schemas/user.schema';


@Injectable()
export class TwitterService {
  private readonly twitterApiUrl = 'https://api.twitter.com/2';

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Tweet.name) private tweetModel: Model<Tweet>,
    // User model must be injected here to be used in postTweet
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>, 
  ) {}

  // Post tweet immediately
  async postTweet(createTweetDto: CreateTweetDto, userId: string) {
    // Step 1: Find the user in the database
    const user = await this.userModel.findById(userId);
    if (!user || !user.accessToken) {
      throw new HttpException('Twitter access token not found for this user.', HttpStatus.UNAUTHORIZED);
    }

    // Step 2: Post the tweet using the user's access token
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.twitterApiUrl}/tweets`,
          { text: createTweetDto.text },
          {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      // Step 3: Save the posted tweet record to our database
      const tweet = new this.tweetModel({
        text: createTweetDto.text,
        twitterId: data.data.id,
        userId: userId,
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
       const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
      throw new HttpException(
        `Failed to post tweet: ${errorMessage}`,
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

  // Get scheduled tweets for a user
  async getScheduledTweets(userId: string) {
    return this.tweetModel.find({
      userId,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() },
    }).sort({ scheduledAt: 1 });
  }

  // Get posted tweets for a user
  async getPostedTweets(userId: string) {
    return this.tweetModel.find({
      userId,
      status: 'posted',
    }).sort({ postedAt: -1 });
  }

} 