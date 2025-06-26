// File: x_scheduler_app/src/twitter/twitter.service.ts

import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agenda } from '@hokify/agenda';
import { firstValueFrom } from 'rxjs';
import { Tweet } from './schemas/tweet.schema';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { ScheduleTweetDto } from './dto/schedule-tweet.dto';
import { User, UserDocument } from '../Auth/schemas/user.schema';
import { AGENDA_TOKEN } from '../agenda/agenda.module';
import { TweetDocument } from './schemas/tweet.schema';
import { HydratedDocument } from 'mongoose';



@Injectable()
export class TwitterService {
  private readonly twitterApiUrl = 'https://api.twitter.com/2';

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Tweet.name) private tweetModel: Model<Tweet>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(AGENDA_TOKEN) private readonly agenda: Agenda, // You are injecting Agenda
  ) {}

  
  async postTweet(createTweetDto: CreateTweetDto, userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.accessToken) {
      throw new HttpException('Twitter access token not found for this user.', HttpStatus.UNAUTHORIZED);
    }

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
      throw new HttpException(`Failed to post tweet: ${errorMessage}`, HttpStatus.BAD_REQUEST);
    }
  }

  
  async scheduleTweet(scheduleTweetDto: ScheduleTweetDto, userId: string): Promise<any> {
    if (!scheduleTweetDto.scheduledAt) {
      throw new HttpException('A valid schedule date is required.', HttpStatus.BAD_REQUEST);
    }

    const scheduleDate = new Date(scheduleTweetDto.scheduledAt);

    if (isNaN(scheduleDate.getTime()) || scheduleDate.getTime() < Date.now()) {
      throw new HttpException('Schedule date must be a valid date in the future.', HttpStatus.BAD_REQUEST);
    }
    
    // Step 1: Create and save the new tweet document
    const newTweet = new this.tweetModel({
      text: scheduleTweetDto.text,
      userId: userId,
      scheduledAt: scheduleDate,
      status: 'scheduled',
    });

const savedTweet: HydratedDocument<Tweet> = await newTweet.save();


    // --- THIS IS THE FIX ---
    // Use 'this.agenda' which was injected in the constructor, not 'this.tweetsQueue'
    if (!savedTweet.scheduledAt) {
  throw new Error('scheduledAt is missing on saved tweet');
}
    await this.agenda.schedule(
      savedTweet.scheduledAt!, // Use the date from the saved document
      'post-tweet',           // The name of the job
      { tweetId: savedTweet._id.toString() } // The data to pass to the job
    );
    // -----------------------

    return {
      success: true,
      data: savedTweet,
      message: 'Tweet scheduled successfully with Agenda!',
    };
  }

  /**
   * Retrieves a list of future scheduled tweets for a user.
   */
  async getScheduledTweets(userId: string): Promise<Tweet[]> {
    return this.tweetModel.find({
      userId,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() },
    }).sort({ scheduledAt: 1 });
  }

  /**
   * Retrieves a list of already posted tweets for a user.
   */
  async getPostedTweets(userId: string): Promise<Tweet[]> {
    return this.tweetModel.find({
      userId,
      status: 'posted',
    }).sort({ postedAt: -1 });
  }
}