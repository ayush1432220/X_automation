import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Headers, 
  UseGuards,
  Request,
  HttpException,
  HttpStatus 
} from '@nestjs/common';
import { TwitterService } from './twitter.service';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { ScheduleTweetDto } from './dto/schedule-tweet.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@Controller('twitter')
@UseGuards(JwtAuthGuard)
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  @Post('post')
  async postTweet(
    @Body() createTweetDto: CreateTweetDto,
    @Request() req,
  ) {
    if (!req.user.accessToken) {
      throw new HttpException('Twitter access token required', HttpStatus.UNAUTHORIZED);
    }
    
    return this.twitterService.postTweet(createTweetDto, req.user.accessToken);
  }

  @Post('schedule')
  async scheduleTweet(
    @Body() scheduleTweetDto: ScheduleTweetDto,
    @Request() req,
  ) {
    return this.twitterService.scheduleTweet(scheduleTweetDto, req.user.userId);
  }

  @Get('scheduled')
  async getScheduledTweets(@Request() req) {
    return this.twitterService.getScheduledTweets(req.user.userId);
  }

  @Get('posted')
  async getPostedTweets(@Request() req) {
    return this.twitterService.getPostedTweets(req.user.userId);
  }
}
